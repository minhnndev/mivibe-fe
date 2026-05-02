// LUT Admin Data Store
// Uses localStorage as local state, syncs to Supabase when configured

import { supabase, isConfigured } from "./supabase";
import type { Category, CategoryInput, Lut, LutInput, Manifest } from "./types";

// ─── Mock seed data ────────────────────────────────────────────────────────────
const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Cinematic",
    slug: "cinematic",
    description: "Hollywood-style color grades",
    sort_order: 0,
  },
  {
    id: "cat-2",
    name: "Vintage",
    slug: "vintage",
    description: "Film emulation & retro tones",
    sort_order: 1,
  },
  {
    id: "cat-3",
    name: "Portrait",
    slug: "portrait",
    description: "Optimized for skin tones",
    sort_order: 2,
  },
  {
    id: "cat-4",
    name: "Landscape",
    slug: "landscape",
    description: "Nature & outdoor scenes",
    sort_order: 3,
  },
];

const SEED_LUTS: Lut[] = [
  {
    id: "lut-1",
    name: "Cinematic Warm",
    filename: "cinematic_warm.cube",
    category_id: "cat-1",
    is_active: true,
    is_free: true,
    sort_order: 0,
    intensity: 1.0,
    tags: ["warm", "cinematic"],
    description: "Rich warm tones inspired by Hollywood blockbusters",
  },
  {
    id: "lut-2",
    name: "Cool Blue",
    filename: "cool_blue.cube",
    category_id: "cat-1",
    is_active: true,
    is_free: false,
    sort_order: 1,
    intensity: 0.85,
    tags: ["cool", "blue", "cinematic"],
    description: "Cool desaturated look for dramatic scenes",
  },
  {
    id: "lut-3",
    name: "Vintage Fade",
    filename: "vintage_fade.cube",
    category_id: "cat-2",
    is_active: true,
    is_free: false,
    sort_order: 0,
    intensity: 0.9,
    tags: ["vintage", "faded", "film"],
    description: "Faded film emulation with lifted blacks",
  },
  {
    id: "lut-4",
    name: "Teal & Orange",
    filename: "teal_orange.cube",
    category_id: "cat-1",
    is_active: true,
    is_free: false,
    sort_order: 2,
    intensity: 1.0,
    tags: ["teal", "orange", "contrast"],
    description: "Classic teal shadows and orange highlights",
  },
  {
    id: "lut-5",
    name: "B&W High Contrast",
    filename: "bw_contrast.cube",
    category_id: "cat-1",
    is_active: true,
    is_free: true,
    sort_order: 3,
    intensity: 1.0,
    tags: ["bw", "monochrome", "contrast"],
    description: "Dramatic black and white with punchy contrast",
  },
  {
    id: "lut-6",
    name: "Sunset Glow",
    filename: "sunset_glow.cube",
    category_id: "cat-4",
    is_active: true,
    is_free: false,
    sort_order: 0,
    intensity: 0.8,
    tags: ["warm", "sunset", "golden"],
    description: "Golden hour warmth for outdoor photography",
  },
  {
    id: "lut-7",
    name: "Matte Green",
    filename: "matte_green.cube",
    category_id: "cat-4",
    is_active: false,
    is_free: false,
    sort_order: 1,
    intensity: 0.75,
    tags: ["green", "matte", "moody"],
    description: "Moody green matte look for nature scenes",
  },
  {
    id: "lut-8",
    name: "Nordic Pale",
    filename: "nordic_pale.cube",
    category_id: "cat-2",
    is_active: true,
    is_free: true,
    sort_order: 1,
    intensity: 0.95,
    tags: ["pale", "nordic", "cool", "clean"],
    description: "Clean pale Scandinavian aesthetic",
  },
];

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`lut_admin_${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`lut_admin_${key}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  if (isConfigured) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (!error && data) return data as Category[];
  }
  return loadLocal("categories", SEED_CATEGORIES);
}

export async function saveCategory(
  category: CategoryInput,
): Promise<Category[]> {
  const categories = await getCategories();
  const slug =
    category.slug ?? category.name.toLowerCase().replace(/\s+/g, "-");
  const description = category.description ?? "";
  const sort_order = category.sort_order ?? 0;

  const existing = categories.findIndex((c) => c.id === category.id);
  const updated: Category[] =
    existing >= 0
      ? categories.map((c) =>
          c.id === category.id
            ? {
                ...c,
                ...category,
                slug,
                description,
                sort_order,
              }
            : c,
        )
      : [
          ...categories,
          {
            id: `cat-${Date.now()}`,
            created_at: new Date().toISOString(),
            name: category.name,
            slug,
            description,
            sort_order,
          },
        ];
  saveLocal("categories", updated);

  if (isConfigured) {
    const payload =
      existing >= 0 ? updated[existing]! : updated[updated.length - 1]!;
    const { error } = await supabase.from("categories").upsert(payload);
    if (error) console.warn("Supabase sync failed:", error);
  }
  return updated;
}

export async function deleteCategory(id: string): Promise<Category[]> {
  const categories = await getCategories();
  const updated = categories.filter((c) => c.id !== id);
  saveLocal("categories", updated);
  if (isConfigured) await supabase.from("categories").delete().eq("id", id);
  return updated;
}

// ─── LUTs ─────────────────────────────────────────────────────────────────────
export async function getLuts(): Promise<Lut[]> {
  if (isConfigured) {
    const { data, error } = await supabase
      .from("luts")
      .select("*, categories(*)")
      .order("sort_order");
    if (!error && data) return data as Lut[];
  }
  return loadLocal("luts", SEED_LUTS);
}

export async function saveLut(lut: LutInput): Promise<Lut[]> {
  const luts = await getLuts();
  const existing = luts.findIndex((l) => l.id === lut.id);
  const existingItem = existing >= 0 ? luts[existing] : undefined;
  const item: Lut = {
    id: lut.id ?? `lut-${Date.now()}`,
    name: lut.name,
    filename: lut.filename,
    category_id: lut.category_id ?? null,
    description: lut.description ?? null,
    is_active: lut.is_active ?? true,
    is_free: lut.is_free ?? false,
    sort_order: lut.sort_order ?? 0,
    intensity: lut.intensity ?? 1.0,
    tags: lut.tags ?? [],
    preview_url: lut.preview_url ?? null,
    download_url: lut.download_url ?? null,
    created_at:
      lut.created_at ?? existingItem?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated: Lut[] =
    existing >= 0
      ? luts.map((l) => (l.id === lut.id ? { ...l, ...item } : l))
      : [...luts, item];
  saveLocal("luts", updated);

  if (isConfigured) {
    const { error } = await supabase.from("luts").upsert(item);
    if (error) console.warn("Supabase sync failed:", error);
  }
  return updated;
}

export async function deleteLut(id: string): Promise<Lut[]> {
  const luts = await getLuts();
  const updated = luts.filter((l) => l.id !== id);
  saveLocal("luts", updated);
  if (isConfigured) await supabase.from("luts").delete().eq("id", id);
  return updated;
}

// ─── Mobile Manifest Export ───────────────────────────────────────────────────
export async function generateManifest(): Promise<Manifest> {
  const [luts, categories] = await Promise.all([getLuts(), getCategories()]);
  return {
    version: Date.now(),
    generated_at: new Date().toISOString(),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      sort_order: c.sort_order,
    })),
    luts: luts
      .filter((l) => l.is_active)
      .map((l) => ({
        id: l.id,
        name: l.name,
        filename: l.filename,
        category_id: l.category_id ?? null,
        is_free: l.is_free,
        sort_order: l.sort_order,
        intensity: l.intensity,
        tags: l.tags ?? [],
        preview_url: l.preview_url ?? null,
        download_url: l.download_url ?? `/luts-cube/${l.filename}`,
      })),
  };
}

// ─── Available .cube files (from public/luts-cube) ────────────────────────────
export const KNOWN_CUBE_FILES = [
  "cinematic_warm.cube",
  "cool_blue.cube",
  "vintage_fade.cube",
  "teal_orange.cube",
  "bw_contrast.cube",
  "sunset_glow.cube",
  "matte_green.cube",
  "nordic_pale.cube",
] as const;
