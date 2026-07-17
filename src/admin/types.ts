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

export type RemoteCategory = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  order: number;
  isActive: boolean;
  packageIds: string[];
};

export type LutPackage = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  styleTag: string;
  order: number;
  isActive: boolean;
  lutIds: string[];
  version?: string;
  sizeBytes?: number | null;
};

export type RemoteLut = {
  id: string;
  name: string;
  fileName: string;
  storageKey: string;
  downloadUrl: string;
  previewImage: string;
  toneTag: string;
  styleTag: string;
  isActive: boolean;
  currentPackageId: string | null;
  intensity: number;
  version?: string;
  sizeBytes?: number | null;
  checksum?: string | null;
};

export type RemoteConfig = {
  version: string;
  updatedAt: string;
  categories: RemoteCategory[];
  packages: LutPackage[];
  luts: RemoteLut[];
};

export type RemoteConfigSelection =
  | { type: "root"; id: "root" }
  | { type: "category"; id: string }
  | { type: "package"; id: string };

export type ViewMode = "grid" | "list";

export type ActiveTab = "luts" | "categories" | "remote-config" | "export";

export type FilterStatus = "all" | "active" | "inactive" | "free";

export type AdminTheme = "dark" | "light";

export type Toast = { msg: string; type: "success" | "error" };

export type PreviewImage = { label: string; url: string };

export type ApiEndpoint = {
  method: "GET";
  path: string;
  desc: string;
};
