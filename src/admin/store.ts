// LUT Admin Data Store
// Uses localStorage as local state, syncs to Supabase when configured

import { supabase, isConfigured } from "./supabase";
import {
  createRemoteConfigFromLuts,
  normalizeRemoteConfig,
} from "./remoteConfigUtils";
import type {
  Category,
  CategoryInput,
  Lut,
  LutInput,
  Manifest,
  RemoteConfig,
} from "./types";

export const LUTS_BASE_URL =
  window.__MIVIBE_ENV__?.VITE_LUTS_BASE_URL ||
  import.meta.env.VITE_LUTS_BASE_URL;

const REMOTE_CONFIG_ID = "mivibe_lut_remote_config";

type RemoteConfigRow = {
  id: string;
  config: RemoteConfig;
  updated_at?: string;
};

type LutPackageDownloadStatsRow = {
  package_id: string;
  download_count: number;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mergePackageDownloadStats(
  config: RemoteConfig,
  stats: LutPackageDownloadStatsRow[],
): RemoteConfig {
  const statsByPackageId = new Map(
    stats.map((row) => [row.package_id, row.download_count]),
  );

  return {
    ...config,
    packages: config.packages.map((pkg) => ({
      ...pkg,
      downloadCount: statsByPackageId.get(pkg.id) ?? pkg.downloadCount ?? 0,
    })),
  };
}

async function fetchPackageDownloadStats() {
  const { data, error } = await supabase
    .from("lut_package_download_stats")
    .select("package_id, download_count");

  if (error) {
    console.warn(`Package download stats fetch failed: ${error.message}`);
    return [];
  }

  return (data ?? []) as LutPackageDownloadStatsRow[];
}

async function syncPackageDownloadStats() {
  const { error } = await supabase.rpc("sync_lut_package_download_stats");
  if (error) {
    console.warn(`Package download stats sync failed: ${error.message}`);
  }
}

async function withPackageDownloadStats(config: RemoteConfig) {
  if (!isConfigured) return config;

  await syncPackageDownloadStats();
  return mergePackageDownloadStats(config, await fetchPackageDownloadStats());
}

export function getLutUrl(storageKey: string): string {
  const fullUrl = LUTS_BASE_URL + "/luts/";
  return `${fullUrl.replace(/\/$/, "")}/${storageKey.replace(/^\//, "")}`;
}

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
    slug: "cinematic-warm",
    filename: "cinematic_warm.cube",
    storage_key: "cinematic_warm.cube",
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
    slug: "cool-blue",
    filename: "cool_blue.cube",
    storage_key: "cool_blue.cube",
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
    slug: "vintage-fade",
    filename: "vintage_fade.cube",
    storage_key: "vintage_fade.cube",
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
    slug: "teal-orange",
    filename: "teal_orange.cube",
    storage_key: "teal_orange.cube",
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
    slug: "bw-high-contrast",
    filename: "bw_contrast.cube",
    storage_key: "bw_contrast.cube",
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
    slug: "sunset-glow",
    filename: "sunset_glow.cube",
    storage_key: "sunset_glow.cube",
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
    slug: "matte-green",
    filename: "matte_green.cube",
    storage_key: "matte_green.cube",
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
    slug: "nordic-pale",
    filename: "nordic_pale.cube",
    storage_key: "nordic_pale.cube",
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
    if (error) throw new Error(`Categories fetch failed: ${error.message}`);
    return (data ?? []) as Category[];
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
  if (isConfigured) {
    const payload =
      existing >= 0 ? updated[existing]! : updated[updated.length - 1]!;
    const { error } = await supabase.from("categories").upsert(payload);
    if (error) throw new Error(`Category save failed: ${error.message}`);
  }
  saveLocal("categories", updated);
  return updated;
}

export async function deleteCategory(id: string): Promise<Category[]> {
  const categories = await getCategories();
  const updated = categories.filter((c) => c.id !== id);
  if (isConfigured) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(`Category delete failed: ${error.message}`);
  }
  saveLocal("categories", updated);
  return updated;
}

// ─── LUTs ─────────────────────────────────────────────────────────────────────
export async function getLuts(): Promise<Lut[]> {
  if (isConfigured) {
    const { data, error } = await supabase
      .from("luts")
      .select("*, categories(*)")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw new Error(`LUT fetch failed: ${error.message}`);
    return (data ?? []) as Lut[];
  }
  return loadLocal("luts", SEED_LUTS);
}

export async function saveLut(lut: LutInput): Promise<Lut[]> {
  const luts = await getLuts();
  const existing = luts.findIndex((l) => l.id === lut.id);
  const existingItem = existing >= 0 ? luts[existing] : undefined;
  const filename = lut.filename || lut.storage_key || "";
  const storage_key = lut.storage_key || lut.filename || "";
  const item: Lut = {
    id: lut.id ?? `lut-${Date.now()}`,
    name: lut.name,
    slug: lut.slug ?? existingItem?.slug ?? slugify(lut.name),
    filename,
    storage_key,
    category_id: lut.category_id ?? null,
    description: lut.description ?? null,
    is_active: lut.is_active ?? true,
    is_free: lut.is_free ?? false,
    sort_order: lut.sort_order ?? 0,
    intensity: lut.intensity ?? 1.0,
    tags: lut.tags ?? [],
    preview_url: lut.preview_url ?? null,
    download_url: getLutUrl(storage_key),
    created_at:
      lut.created_at ?? existingItem?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated: Lut[] =
    existing >= 0
      ? luts.map((l) => (l.id === lut.id ? { ...l, ...item } : l))
      : [...luts, item];
  if (isConfigured) {
    const payload = {
      name: item.name,
      slug: item.slug,
      filename: item.filename,
      storage_key: item.storage_key,
      category_id: item.category_id,
      is_active: item.is_active,
      is_free: item.is_free,
      intensity: item.intensity,
      tags: item.tags,
    };
    const { error } =
      existing >= 0
        ? await supabase.from("luts").update(payload).eq("id", item.id)
        : await supabase.from("luts").insert({ id: item.id, ...payload });
    if (error) throw new Error(`LUT save failed: ${error.message}`);
  }
  saveLocal("luts", updated);
  return updated;
}

export async function deleteLut(id: string): Promise<Lut[]> {
  const luts = await getLuts();
  const updated = luts.filter((l) => l.id !== id);
  if (isConfigured) {
    const { error } = await supabase.from("luts").delete().eq("id", id);
    if (error) throw new Error(`LUT delete failed: ${error.message}`);
  }
  saveLocal("luts", updated);
  return updated;
}

// ─── Remote Config ────────────────────────────────────────────────────────────
export async function getRemoteConfig(): Promise<RemoteConfig> {
  const luts = await getLuts();
  const categories = await getCategories();
  const fallback = createRemoteConfigFromLuts(luts, categories, getLutUrl);
  const localConfig = loadLocal("remote_config", fallback);

  if (isConfigured) {
    const { data, error } = await supabase
      .from("remote_configs")
      .select("id, config, updated_at")
      .eq("id", REMOTE_CONFIG_ID)
      .maybeSingle();

    if (!error && data) {
      const row = data as RemoteConfigRow;
      const remoteConfig = await withPackageDownloadStats(
        normalizeRemoteConfig(row.config),
      );
      saveLocal("remote_config", remoteConfig);
      return remoteConfig;
    }

    if (error) {
      throw new Error(`Remote config fetch failed: ${error.message}`);
    }
  }

  return normalizeRemoteConfig(localConfig);
}

export async function saveRemoteConfig(config: RemoteConfig): Promise<RemoteConfig> {
  const updated = normalizeRemoteConfig({
    ...config,
    updatedAt: new Date().toISOString(),
  });

  if (isConfigured) {
    const { data, error } = await supabase
      .from("remote_configs")
      .upsert({
        id: REMOTE_CONFIG_ID,
        config: updated,
        updated_at: updated.updatedAt,
      })
      .select("id, config, updated_at")
      .single();

    if (error) {
      throw new Error(`Remote config publish failed: ${error.message}`);
    }
    if (!data) {
      throw new Error("Remote config publish failed: no row returned");
    }

    await syncPackageDownloadStats();
  }

  const merged = await withPackageDownloadStats(updated);
  saveLocal("remote_config", merged);
  return merged;
}

export async function resetRemoteConfigFromLuts(): Promise<RemoteConfig> {
  const [luts, categories] = await Promise.all([getLuts(), getCategories()]);
  const config = createRemoteConfigFromLuts(luts, categories, getLutUrl);
  return saveRemoteConfig(config);
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
        slug: l.slug ?? null,
        filename: l.filename,
        storage_key: l.storage_key ?? l.filename,
        category_id: l.category_id ?? null,
        is_free: l.is_free,
        sort_order: l.sort_order,
        intensity: l.intensity,
        tags: l.tags ?? [],
        preview_url: l.preview_url ?? null,
        download_url: l.download_url ?? getLutUrl(l.storage_key ?? l.filename),
      })),
  };
}

// ─── Available .cube files (from R2 bucket) ───────────────────────────────────
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
