/**
 * LUT Preview Engine
 * Parses .cube LUT files and applies them to images using Canvas 2D
 * (software rendering, no WebGL required for small 3D LUTs)
 */

export type CubeLut = {
  title: string
  size: number
  data: Array<[number, number, number]>
}

// Parse a .cube LUT file text into a structured object
export function parseCube(text: string): CubeLut {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
  let size = 17
  let title = ''
  const data: Array<[number, number, number]> = []

  for (const line of lines) {
    if (line.startsWith('LUT_3D_SIZE')) {
      size = Number.parseInt(line.split(/\s+/)[1] ?? '17', 10)
    } else if (line.startsWith('TITLE')) {
      title = line.replace('TITLE', '').trim().replace(/"/g, '')
    } else if (
      line.startsWith('DOMAIN_MIN') ||
      line.startsWith('DOMAIN_MAX') ||
      line.startsWith('LUT_')
    ) {
      // skip metadata
    } else {
      const parts = line.split(/\s+/).map(Number)
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        data.push([parts[0]!, parts[1]!, parts[2]!])
      }
    }
  }

  return { title, size, data }
}

// Trilinear interpolation for 3D LUT lookup
function trilinearInterp(
  lut: CubeLut,
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const { size, data } = lut
  const maxIdx = size - 1

  // Scale to LUT index space
  const ri = r * maxIdx
  const gi = g * maxIdx
  const bi = b * maxIdx

  // Floor indices
  const r0 = Math.min(Math.floor(ri), maxIdx - 1)
  const g0 = Math.min(Math.floor(gi), maxIdx - 1)
  const b0 = Math.min(Math.floor(bi), maxIdx - 1)

  const r1 = Math.min(r0 + 1, maxIdx)
  const g1 = Math.min(g0 + 1, maxIdx)
  const b1 = Math.min(b0 + 1, maxIdx)

  // Fractional parts
  const rf = ri - r0
  const gf = gi - g0
  const bf = bi - b0

  // LUT index helper: cube stored as [B][G][R] in .cube format
  const idx = (rIdx: number, gIdx: number, bIdx: number) =>
    bIdx * size * size + gIdx * size + rIdx

  const c000 = data[idx(r0, g0, b0)] ?? [0, 0, 0]
  const c100 = data[idx(r1, g0, b0)] ?? [0, 0, 0]
  const c010 = data[idx(r0, g1, b0)] ?? [0, 0, 0]
  const c110 = data[idx(r1, g1, b0)] ?? [0, 0, 0]
  const c001 = data[idx(r0, g0, b1)] ?? [0, 0, 0]
  const c101 = data[idx(r1, g0, b1)] ?? [0, 0, 0]
  const c011 = data[idx(r0, g1, b1)] ?? [0, 0, 0]
  const c111 = data[idx(r1, g1, b1)] ?? [0, 0, 0]

  const lerp = (a: number, b2: number, t: number) => a + (b2 - a) * t
  const lerpArr = (
    a: [number, number, number],
    b2: [number, number, number],
    t: number,
  ): [number, number, number] => [
    lerp(a[0], b2[0], t),
    lerp(a[1], b2[1], t),
    lerp(a[2], b2[2], t),
  ]

  const c00 = lerpArr(c000, c100, rf)
  const c01 = lerpArr(c001, c101, rf)
  const c10 = lerpArr(c010, c110, rf)
  const c11 = lerpArr(c011, c111, rf)

  const c0 = lerpArr(c00, c10, gf)
  const c1 = lerpArr(c01, c11, gf)

  return lerpArr(c0, c1, bf)
}

// Apply LUT to an ImageData object, returns new ImageData
export function applyLutToImageData(
  imageData: ImageData,
  lut: CubeLut,
  intensity = 1.0,
): ImageData {
  const { data, width, height } = imageData
  const output = new ImageData(width, height)
  const outData = output.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]! / 255
    const g = data[i + 1]! / 255
    const b = data[i + 2]! / 255
    const a = data[i + 3]!

    const mapped = trilinearInterp(lut, r, g, b)

    outData[i] = Math.round((mapped[0] * intensity + r * (1 - intensity)) * 255)
    outData[i + 1] = Math.round((mapped[1] * intensity + g * (1 - intensity)) * 255)
    outData[i + 2] = Math.round((mapped[2] * intensity + b * (1 - intensity)) * 255)
    outData[i + 3] = a
  }

  return output
}

// Load a .cube file from a URL and parse it
export async function loadLutFromUrl(url: string): Promise<CubeLut> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load LUT: ${url}`)
  const text = await res.text()
  return parseCube(text)
}

// Apply LUT to an image URL, return a canvas data URL
export async function renderLutPreview(
  imageUrl: string,
  lutUrl: string,
  intensity = 1.0,
  maxSize = 400,
): Promise<string> {
  // Load image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = imageUrl
  })

  // Load LUT
  const lut = await loadLutFromUrl(lutUrl)

  // Scale image
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context not available')

  ctx.drawImage(img, 0, 0, w, h)

  const imageData = ctx.getImageData(0, 0, w, h)
  const processed = applyLutToImageData(imageData, lut, intensity)
  ctx.putImageData(processed, 0, 0)

  return canvas.toDataURL('image/jpeg', 0.9)
}
