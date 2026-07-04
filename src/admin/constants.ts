import { Download, GitBranch, Layers, Tag } from "lucide-react";
import type { ActiveTab, ApiEndpoint, PreviewImage } from "./types";

export const DEFAULT_IMAGES: PreviewImage[] = [
  {
    label: "Landscape",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    label: "Portrait",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
  },
  {
    label: "Urban",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
  },
  {
    label: "Golden Hour",
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
  },
];

export const NAV_ITEMS = [
  { id: "luts", icon: Layers, label: "LUT Library" },
  { id: "categories", icon: Tag, label: "Categories" },
  { id: "remote-config", icon: GitBranch, label: "Remote Config" },
  { id: "export", icon: Download, label: "Export & API" },
] satisfies Array<{
  id: ActiveTab;
  icon: typeof Layers;
  label: string;
}>;

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/rest/v1/luts?is_active=eq.true&select=*",
    desc: "Fetch all active LUTs",
  },
  {
    method: "GET",
    path: "/rest/v1/categories?select=*&order=sort_order",
    desc: "Fetch all categories",
  },
  {
    method: "GET",
    path: "/rest/v1/luts?select=*,categories(*)&category_id=eq.{id}",
    desc: "Fetch LUTs by category",
  },
  {
    method: "GET",
    path: "/rest/v1/remote_configs?id=eq.mivibe_lut_remote_config&select=config,updated_at",
    desc: "Fetch mobile remote config tree",
  },
];
