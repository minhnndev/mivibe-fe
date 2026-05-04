import { LUTS_BASE_URL } from "./store";

export type CubeLut = {
  title: string;
  size: number;
  data: Uint8Array;
};

type ScaledImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

type WebGlRenderer = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  sourceTexture: WebGLTexture;
  lutTexture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  canvas: HTMLCanvasElement;
  uniforms: {
    source: WebGLUniformLocation | null;
    lut: WebGLUniformLocation | null;
    lutSize: WebGLUniformLocation | null;
    intensity: WebGLUniformLocation | null;
  };
};

const lutCache = new Map<string, Promise<CubeLut>>();
const imageCache = new Map<string, Promise<ScaledImage>>();
let renderer: WebGlRenderer | null | false = null;

function runIdle<T>(work: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = () => {
      try {
        resolve(work());
      } catch (err) {
        reject(err);
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 500 });
    } else {
      window.setTimeout(run, 0);
    }
  });
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message =
      gl.getShaderInfoLog(shader) || "WebGL shader compile failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertex = createShader(
    gl,
    gl.VERTEX_SHADER,
    `#version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`,
  );
  const fragment = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    `#version 300 es
    precision highp float;
    precision highp sampler3D;
    uniform sampler2D u_source;
    uniform sampler3D u_lut;
    uniform float u_lutSize;
    uniform float u_intensity;
    in vec2 v_uv;
    out vec4 outColor;
    void main() {
      vec4 color = texture(u_source, v_uv);
      vec3 coord = clamp(color.rgb, 0.0, 1.0);
      coord = (coord * (u_lutSize - 1.0) + 0.5) / u_lutSize;
      vec3 mapped = texture(u_lut, coord).rgb;
      outColor = vec4(mix(color.rgb, mapped, u_intensity), color.a);
    }`,
  );
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message =
      gl.getProgramInfoLog(program) || "WebGL program link failed";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function getRenderer(): WebGlRenderer | null {
  if (renderer === false) return null;
  if (renderer) return renderer;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: true,
      stencil: false,
    });
    if (!gl) {
      renderer = false;
      return null;
    }

    const program = createProgram(gl);
    const vao = gl.createVertexArray();
    const sourceTexture = gl.createTexture();
    const lutTexture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!vao || !sourceTexture || !lutTexture || !framebuffer) {
      throw new Error("Unable to allocate WebGL resources");
    }

    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    renderer = {
      gl,
      program,
      vao,
      sourceTexture,
      lutTexture,
      framebuffer,
      canvas,
      uniforms: {
        source: gl.getUniformLocation(program, "u_source"),
        lut: gl.getUniformLocation(program, "u_lut"),
        lutSize: gl.getUniformLocation(program, "u_lutSize"),
        intensity: gl.getUniformLocation(program, "u_intensity"),
      },
    };
    return renderer;
  } catch (err) {
    console.warn("WebGL LUT renderer unavailable, falling back to CPU:", err);
    renderer = false;
    return null;
  }
}

function renderWithWebGl(
  source: ScaledImage,
  lut: CubeLut,
  intensity: number,
): string | null {
  const rendererInstance = getRenderer();
  if (!rendererInstance) return null;

  const { gl, program, vao, sourceTexture, lutTexture, canvas, uniforms } =
    rendererInstance;
  canvas.width = source.width;
  canvas.height = source.height;
  gl.viewport(0, 0, source.width, source.height);
  gl.useProgram(program);
  gl.bindVertexArray(vao);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    source.width,
    source.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    source.data,
  );

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_3D, lutTexture);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
  gl.texImage3D(
    gl.TEXTURE_3D,
    0,
    gl.RGB8,
    lut.size,
    lut.size,
    lut.size,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    lut.data,
  );

  gl.uniform1i(uniforms.source, 0);
  gl.uniform1i(uniforms.lut, 1);
  gl.uniform1f(uniforms.lutSize, lut.size);
  gl.uniform1f(uniforms.intensity, intensity);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  return canvas.toDataURL("image/jpeg", 0.88);
}

// Parse a .cube LUT file text into a structured object
export function parseCube(text: string): CubeLut {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  let size = 17;
  let title = "";
  const values: number[] = [];

  for (const line of lines) {
    if (line.startsWith("LUT_3D_SIZE")) {
      size = Number.parseInt(line.split(/\s+/)[1] ?? "17", 10);
    } else if (line.startsWith("TITLE")) {
      title = line.replace("TITLE", "").trim().replace(/"/g, "");
    } else if (
      line.startsWith("DOMAIN_MIN") ||
      line.startsWith("DOMAIN_MAX") ||
      line.startsWith("LUT_")
    ) {
      // Skip metadata. This previewer only needs normalized 3D LUT entries.
    } else {
      const parts = line.split(/\s+/).map(Number);
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        values.push(parts[0]!, parts[1]!, parts[2]!);
      }
    }
  }

  if (size < 2 || size > 64) {
    throw new Error(`Unsupported LUT size: ${size}`);
  }

  const expected = size * size * size * 3;
  if (values.length < expected) {
    throw new Error(`Invalid LUT data: expected ${expected / 3} entries`);
  }

  const data = new Uint8Array(expected);
  for (let i = 0; i < expected; i += 1) {
    data[i] = Math.max(0, Math.min(255, Math.round(values[i]! * 255)));
  }

  return { title, size, data };
}

// Apply LUT to an ImageData object, returns new ImageData
export function applyLutToImageData(
  imageData: ImageData,
  lut: CubeLut,
  intensity = 1.0,
): ImageData {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  const outData = output.data;
  const lutData = lut.data;
  const { size } = lut;
  const maxIdx = size - 1;
  const row = size * 3;
  const slice = size * size * 3;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]! / 255;
    const g = data[i + 1]! / 255;
    const b = data[i + 2]! / 255;
    const ri = r * maxIdx;
    const gi = g * maxIdx;
    const bi = b * maxIdx;
    const r0 = Math.min(Math.floor(ri), maxIdx - 1);
    const g0 = Math.min(Math.floor(gi), maxIdx - 1);
    const b0 = Math.min(Math.floor(bi), maxIdx - 1);
    const r1 = Math.min(r0 + 1, maxIdx);
    const g1 = Math.min(g0 + 1, maxIdx);
    const b1 = Math.min(b0 + 1, maxIdx);
    const rf = ri - r0;
    const gf = gi - g0;
    const bf = bi - b0;
    const idx = (rIdx: number, gIdx: number, bIdx: number) =>
      bIdx * slice + gIdx * row + rIdx * 3;
    const mix = (channel: 0 | 1 | 2) => {
      const c000 = lutData[idx(r0, g0, b0) + channel]!;
      const c100 = lutData[idx(r1, g0, b0) + channel]!;
      const c010 = lutData[idx(r0, g1, b0) + channel]!;
      const c110 = lutData[idx(r1, g1, b0) + channel]!;
      const c001 = lutData[idx(r0, g0, b1) + channel]!;
      const c101 = lutData[idx(r1, g0, b1) + channel]!;
      const c011 = lutData[idx(r0, g1, b1) + channel]!;
      const c111 = lutData[idx(r1, g1, b1) + channel]!;
      const c00 = c000 + (c100 - c000) * rf;
      const c10 = c010 + (c110 - c010) * rf;
      const c01 = c001 + (c101 - c001) * rf;
      const c11 = c011 + (c111 - c011) * rf;
      const c0 = c00 + (c10 - c00) * gf;
      const c1 = c01 + (c11 - c01) * gf;
      return (c0 + (c1 - c0) * bf) / 255;
    };

    outData[i] = Math.round((mix(0) * intensity + r * (1 - intensity)) * 255);
    outData[i + 1] = Math.round(
      (mix(1) * intensity + g * (1 - intensity)) * 255,
    );
    outData[i + 2] = Math.round(
      (mix(2) * intensity + b * (1 - intensity)) * 255,
    );
    outData[i + 3] = data[i + 3]!;
  }

  return output;
}

function isValidCube(text: string) {
  return text.includes("LUT_3D_SIZE") || text.includes("TITLE");
}

function resolveLutUrl(input: string) {
  // nếu đã là absolute URL thì giữ nguyên
  if (input.startsWith("http")) return input;

  return `${LUTS_BASE_URL}/luts/${input}`;
}
// Load a .cube file from a URL and parse it
export async function loadLutFromUrl(input: string): Promise<CubeLut> {
  const url = resolveLutUrl(input);

  const cached = lutCache.get(url);
  if (cached) return cached;

  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to load LUT (${res.status}): ${url}`);
      }

      const buffer = await res.arrayBuffer();
      const text = new TextDecoder("utf-8").decode(buffer);

      if (text.startsWith("<!doctype html") || text.includes("<html")) {
        throw new Error(`Got HTML instead of LUT: ${url}`);
      }

      if (!isValidCube(text)) {
        throw new Error(`Invalid LUT format: ${url}`);
      }

      return text;
    })
    .then((text) => runIdle(() => parseCube(text)))
    .catch((err) => {
      lutCache.delete(url);
      throw err;
    });

  lutCache.set(url, promise);
  return promise;
}

async function loadScaledImage(
  imageUrl: string,
  maxSize: number,
): Promise<ScaledImage> {
  const cacheKey = `${imageUrl}:${maxSize}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageUrl;
  }).then((img) => {
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    return { width, height, data: new Uint8ClampedArray(imageData.data) };
  });

  imageCache.set(cacheKey, promise);
  return promise;
}

// Apply LUT to an image URL, return a canvas data URL
export async function renderLutPreview(
  imageUrl: string,
  lutUrl: string,
  intensity = 1.0,
  maxSize = 400,
): Promise<string> {
  const [source, lut] = await Promise.all([
    loadScaledImage(imageUrl, maxSize),
    loadLutFromUrl(lutUrl),
  ]);

  return runIdle(() => {
    const gpuPreview = renderWithWebGl(source, lut, intensity);
    if (gpuPreview) return gpuPreview;

    const imageData = new ImageData(
      new Uint8ClampedArray(source.data),
      source.width,
      source.height,
    );
    const processed = applyLutToImageData(imageData, lut, intensity);
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");
    ctx.putImageData(processed, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.88);
  });
}
