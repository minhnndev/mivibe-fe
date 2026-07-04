import type {
  Category,
  Lut,
  LutPackage,
  RemoteCategory,
  RemoteConfig,
  RemoteLut,
} from "./types";

type CategoryPreset = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  keywords: string[];
};

const DEFAULT_CATEGORIES: CategoryPreset[] = [
  {
    id: "cat_film",
    name: "Film",
    description: "Film-inspired color presets with analog tones.",
    coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    keywords: ["film", "analog", "grain", "kodak", "fuji", "fade", "matte"],
  },
  {
    id: "cat_natural",
    name: "Natural",
    description: "Clean everyday color with soft, realistic contrast.",
    coverImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
    keywords: ["natural", "clean", "fresh", "daylight", "neutral", "green"],
  },
  {
    id: "cat_cold",
    name: "Cold",
    description: "Cold urban looks with blue shadows and modern contrast.",
    coverImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    keywords: ["cold", "cool", "blue", "icy", "steel", "nordic", "pale"],
  },
  {
    id: "cat_warm",
    name: "Warm",
    description: "Golden, sunny, cozy LUTs for warm highlights.",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    keywords: ["warm", "sunset", "golden", "sunny", "orange", "cozy"],
  },
  {
    id: "cat_cinematic",
    name: "Cinematic",
    description: "Dramatic cinematic color with stronger mood and contrast.",
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    keywords: ["cinematic", "teal", "orange", "dramatic", "contrast", "hollywood"],
  },
  {
    id: "cat_vintage",
    name: "Vintage",
    description: "Retro faded color, old-photo warmth, and aged print tones.",
    coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
    keywords: ["vintage", "retro", "old", "brown", "washed", "faded"],
  },
  {
    id: "cat_moody",
    name: "Moody",
    description: "Deep shadows, emotional tones, and lower exposure looks.",
    coverImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
    keywords: ["moody", "dark", "shadow", "deep", "noir", "bw", "monochrome"],
  },
  {
    id: "cat_portrait",
    name: "Portrait",
    description: "Skin-friendly LUTs for selfie, fashion, and lifestyle photos.",
    coverImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
    keywords: ["portrait", "skin", "selfie", "fashion", "lifestyle"],
  },
  {
    id: "cat_travel",
    name: "Travel",
    description: "Outdoor, city, beach, and landscape LUTs for travel content.",
    coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    keywords: ["travel", "landscape", "outdoor", "beach", "city", "nature"],
  },
];

const PACKAGE_NAMES: Record<string, string[]> = {
  cat_film: ["Classic Film Pack", "Soft Grain Pack", "Analog Fade Pack"],
  cat_natural: ["Clean Natural Pack", "Soft Daylight Pack", "Fresh Green Pack"],
  cat_cold: ["Cold Urban Pack", "Icy Shadow Pack", "Nordic Pale Pack"],
  cat_warm: ["Golden Hour Pack", "Warm Highlight Pack", "Sunny Cozy Pack"],
  cat_cinematic: ["Teal Orange Pack", "Dark Cinema Pack", "Dramatic Contrast Pack"],
  cat_vintage: ["Vintage Film Pack", "Retro Brown Pack", "Washed Print Pack"],
  cat_moody: ["Deep Mood Pack", "Noir Shadow Pack", "Low Key Pack"],
  cat_portrait: ["Skin Tone Pack", "Soft Portrait Pack", "Lifestyle Pack"],
  cat_travel: ["Travel Outdoor Pack", "City Travel Pack", "Nature Escape Pack"],
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function textForLut(lut: Lut, categories: Category[]) {
  const category = categories.find((item) => item.id === lut.category_id);
  return [
    lut.name,
    lut.slug ?? "",
    lut.filename,
    lut.description ?? "",
    category?.name ?? "",
    category?.slug ?? "",
    ...(lut.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function scoreCategory(text: string, category: CategoryPreset) {
  return category.keywords.reduce(
    (score, keyword) => score + (text.includes(keyword) ? 1 : 0),
    0,
  );
}

function inferCategoryId(lut: Lut, categories: Category[]) {
  const text = textForLut(lut, categories);
  const scored = DEFAULT_CATEGORIES.map((category) => ({
    id: category.id,
    score: scoreCategory(text, category),
  })).sort((a, b) => b.score - a.score);

  return scored[0]?.score ? scored[0].id : "cat_natural";
}

function inferStyleTag(text: string, categoryId: string) {
  if (text.includes("teal") || text.includes("orange")) return "teal-orange";
  if (text.includes("film") || text.includes("analog") || text.includes("kodak") || text.includes("fuji")) return "film";
  if (text.includes("vintage") || text.includes("retro") || text.includes("faded")) return "vintage";
  if (text.includes("portrait") || text.includes("skin")) return "portrait";
  if (text.includes("urban") || text.includes("city")) return "urban";
  if (text.includes("moody") || text.includes("dark") || text.includes("noir")) return "moody";
  return categoryId.replace("cat_", "");
}

function inferToneTag(text: string, categoryId: string) {
  if (text.includes("warm") || text.includes("golden") || text.includes("sunset")) return "warm";
  if (text.includes("cold") || text.includes("cool") || text.includes("blue") || text.includes("nordic")) return "cold";
  if (text.includes("green") || text.includes("fresh")) return "green";
  if (text.includes("bw") || text.includes("black") || text.includes("monochrome")) return "mono";
  if (text.includes("teal")) return "teal";
  return categoryId.replace("cat_", "");
}

function chunkLuts(luts: RemoteLut[]) {
  const chunks: RemoteLut[][] = [];
  for (let index = 0; index < luts.length; index += 9) {
    chunks.push(luts.slice(index, index + 9));
  }

  if (chunks.length > 1) {
    const last = chunks[chunks.length - 1]!;
    const previous = chunks[chunks.length - 2]!;
    if (last.length < 5 && previous.length > 5) {
      while (last.length < 5 && previous.length > 5) {
        last.unshift(previous.pop()!);
      }
    }
  }

  return chunks;
}

export function createRemoteConfigFromLuts(
  luts: Lut[],
  categories: Category[],
): RemoteConfig {
  const grouped = new Map<string, RemoteLut[]>();

  for (const lut of luts) {
    const categoryId = inferCategoryId(lut, categories);
    const text = textForLut(lut, categories);
    const remoteLut: RemoteLut = {
      id: lut.id,
      name: lut.name,
      fileName: lut.filename,
      previewImage: lut.preview_url ?? "",
      toneTag: inferToneTag(text, categoryId),
      styleTag: inferStyleTag(text, categoryId),
      isActive: lut.is_active,
      currentPackageId: null,
    };
    grouped.set(categoryId, [...(grouped.get(categoryId) ?? []), remoteLut]);
  }

  const packages: LutPackage[] = [];
  const remoteLuts: RemoteLut[] = [];
  const remoteCategories: RemoteCategory[] = DEFAULT_CATEGORIES.map(
    (category, index) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      coverImage: category.coverImage,
      order: index + 1,
      isActive: true,
      packageIds: [],
    }),
  );

  for (const category of remoteCategories) {
    const items = (grouped.get(category.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const chunks = chunkLuts(items);
    const names = PACKAGE_NAMES[category.id] ?? [`${category.name} Pack`];

    chunks.forEach((chunk, index) => {
      if (chunk.length === 0) return;
      const packageName = names[index] ?? `${category.name} Pack ${index + 1}`;
      const packageId = `pkg_${slugify(packageName)}`;
      const updatedChunk = chunk.map((lut, order) => ({
        ...lut,
        currentPackageId: packageId,
        toneTag: lut.toneTag || category.name.toLowerCase(),
        styleTag: lut.styleTag || category.name.toLowerCase(),
        order,
      }));

      packages.push({
        id: packageId,
        name: packageName,
        description: `${category.name} LUT package curated by tone, style, and use case.`,
        coverImage: category.coverImage,
        styleTag: category.name.toLowerCase(),
        order: index + 1,
        isActive: true,
        lutIds: updatedChunk.map((lut) => lut.id),
      });
      category.packageIds.push(packageId);
      remoteLuts.push(...updatedChunk);
    });
  }

  return {
    version: "1.0.0",
    updatedAt: new Date().toISOString(),
    categories: remoteCategories,
    packages,
    luts: remoteLuts,
  };
}

export function normalizeRemoteConfig(config: RemoteConfig): RemoteConfig {
  const packageIds = new Set(config.packages.map((item) => item.id));
  const normalizedPackages = config.packages.map((pkg) => ({
    ...pkg,
    lutIds: pkg.lutIds.filter((id) => config.luts.some((lut) => lut.id === id)),
  }));

  return {
    ...config,
    updatedAt: new Date().toISOString(),
    categories: config.categories.map((category) => ({
      ...category,
      packageIds: category.packageIds.filter((id) => packageIds.has(id)),
    })),
    packages: normalizedPackages,
    luts: config.luts.map((lut) => ({
      ...lut,
      currentPackageId:
        lut.currentPackageId && packageIds.has(lut.currentPackageId)
          ? lut.currentPackageId
          : null,
    })),
  };
}

export function validateRemoteConfig(config: RemoteConfig) {
  const errors: string[] = [];
  const checkUnique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${label} ID must be unique: ${id}`);
      seen.add(id);
    }
  };

  checkUnique("Category", config.categories.map((item) => item.id));
  checkUnique("Package", config.packages.map((item) => item.id));
  checkUnique("LUT", config.luts.map((item) => item.id));

  for (const category of config.categories) {
    if (!category.name.trim()) errors.push("Category name is required");
    if (!Number.isFinite(category.order)) errors.push(`${category.name} order must be a number`);
    if (category.coverImage && !isValidUrl(category.coverImage)) {
      errors.push(`${category.name} cover image must be a valid URL`);
    }
  }

  for (const pkg of config.packages) {
    if (!pkg.name.trim()) errors.push("Package name is required");
    if (!Number.isFinite(pkg.order)) errors.push(`${pkg.name} order must be a number`);
    if (pkg.coverImage && !isValidUrl(pkg.coverImage)) {
      errors.push(`${pkg.name} cover image must be a valid URL`);
    }
    if (!config.categories.some((category) => category.packageIds.includes(pkg.id))) {
      errors.push(`${pkg.name} should belong to at least one category`);
    }
  }

  const assignedLuts = new Map<string, number>();
  for (const pkg of config.packages) {
    for (const lutId of pkg.lutIds) {
      assignedLuts.set(lutId, (assignedLuts.get(lutId) ?? 0) + 1);
    }
  }
  for (const [lutId, count] of assignedLuts) {
    if (count > 1) errors.push(`LUT can only belong to one package: ${lutId}`);
  }

  return errors;
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function createId(prefix: string, name: string) {
  return `${prefix}_${slugify(name) || Date.now()}`;
}
