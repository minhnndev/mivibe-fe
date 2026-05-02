export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort_order: number;
  created_at?: string;
};

export type Lut = {
  id: string;
  name: string;
  slug?: string | null;
  filename: string;
  storage_key?: string | null;
  category_id?: string | null;
  description?: string | null;
  is_active: boolean;
  is_free: boolean;
  sort_order: number;
  intensity: number;
  tags?: string[];
  preview_url?: string | null;
  download_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoryInput = Partial<Omit<Category, "id">> & {
  id?: string;
  name: string;
};

export type LutInput = Partial<Omit<Lut, "id">> & {
  id?: string;
  name: string;
  filename?: string;
};

export type Manifest = {
  version: number;
  generated_at: string;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    sort_order: number;
  }>;
  luts: Array<{
    id: string;
    name: string;
    slug?: string | null;
    filename: string;
    storage_key?: string | null;
    category_id?: string | null;
    is_free: boolean;
    sort_order: number;
    intensity: number;
    tags: string[];
    preview_url: string | null;
    download_url: string;
  }>;
};
