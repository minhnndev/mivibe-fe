import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { KNOWN_CUBE_FILES } from "../store";
import type { Category, Lut, LutInput } from "../types";

type LutEditModalProps = {
  lut: Partial<Lut> | null;
  categories: Category[];
  onSave: (lut: LutInput) => void;
  onClose: () => void;
  theme?: "dark" | "light";
};

type LutFormState = {
  name: string;
  slug: string;
  filename: string;
  storage_key: string;
  category_id: string | null;
  description: string;
  is_active: boolean;
  is_free: boolean;
  intensity: number | string;
  sort_order: number | string;
  tags: string;
  id?: string;
  preview_url?: string | null;
  download_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function LutEditModal({
  lut,
  categories,
  onSave,
  onClose,
  theme = "dark",
}: LutEditModalProps) {
  const isNew = !lut?.id;
  const isLight = theme === "light";
  const [form, setForm] = useState<LutFormState>(() => {
    const initial: LutFormState = {
      name: "",
      slug: "",
      filename: KNOWN_CUBE_FILES[0] ?? "",
      storage_key: KNOWN_CUBE_FILES[0] ?? "",
      category_id: null,
      description: "",
      is_active: true,
      is_free: false,
      intensity: 1.0,
      sort_order: 0,
      tags: "",
    };

    if (lut) {
      if (lut.id) initial.id = lut.id;
      if (typeof lut.name === "string") initial.name = lut.name;
      if (typeof lut.slug === "string") initial.slug = lut.slug;
      if (typeof lut.filename === "string") initial.filename = lut.filename;
      initial.storage_key =
        lut.storage_key ?? lut.filename ?? initial.storage_key;
      initial.category_id = (lut.category_id ?? null) as string | null;
      initial.description = (lut.description ?? "") as string;
      initial.is_active = lut.is_active ?? true;
      initial.is_free = lut.is_free ?? false;
      initial.intensity = (lut.intensity ?? 1.0) as number;
      initial.sort_order = (lut.sort_order ?? 0) as number;
      initial.preview_url = lut.preview_url ?? null;
      initial.download_url = lut.download_url ?? null;
      if (lut.created_at) initial.created_at = lut.created_at;
      if (lut.updated_at) initial.updated_at = lut.updated_at;
      initial.tags = Array.isArray(lut.tags) ? lut.tags.join(", ") : "";
    }

    return initial;
  });

  const set = <K extends keyof LutFormState>(k: K, v: LutFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      category_id: form.category_id ?? null,
      intensity: Number.parseFloat(String(form.intensity)) || 1.0,
      sort_order: Number.parseInt(String(form.sort_order), 10) || 0,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    });
  };

  const toggleItems: Array<
    [keyof Pick<LutFormState, "is_active" | "is_free">, string]
  > = [
    ["is_active", "Active"],
    ["is_free", "Free"],
  ];

  const labelClassName = isLight
    ? "text-neutral-600 text-xs font-body mb-1.5 block"
    : "text-white/60 text-xs font-body mb-1.5 block";
  const inputClassName = isLight
    ? "border-neutral-200 bg-white text-neutral-950 placeholder:text-neutral-400 focus-visible:border-neutral-300 focus-visible:ring-neutral-200"
    : "border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:border-white/30 focus-visible:ring-white/10";
  const selectContentClassName = isLight
    ? "border-neutral-200 bg-white text-neutral-950 shadow-lg"
    : "border-white/10 bg-[#111] text-white";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`max-w-lg gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-lg ${
          isLight
            ? "border-neutral-200 bg-white text-neutral-950"
            : "border-white/10 bg-[#111] text-white"
        }`}
      >
        <DialogHeader
          className={
            isLight
              ? "border-b border-neutral-200 p-6"
              : "border-b border-white/10 p-6"
          }
        >
          <DialogTitle
            className={`font-heading text-xl italic ${
              isLight ? "text-neutral-950" : "text-white"
            }`}
          >
            {isNew ? "Add LUT" : "Edit LUT"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Name */}
          <div>
            <label className={labelClassName}>
              Name *
            </label>
            <Input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClassName}
              placeholder="Cinematic Warm"
            />
          </div>

          {/* Filename */}
          <div>
            <label className={labelClassName}>
              LUT File *
            </label>
            <Select
              value={form.filename}
              onValueChange={(value) => {
                set("filename", value);
                set("storage_key", value);
              }}
            >
              <SelectTrigger className={`w-full rounded-lg ${inputClassName}`}>
                <SelectValue placeholder="Select LUT file" />
              </SelectTrigger>
              <SelectContent className={selectContentClassName}>
                {KNOWN_CUBE_FILES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <label className={labelClassName}>
              Category
            </label>
            <Select
              value={form.category_id ?? "none"}
              onValueChange={(value) =>
                set("category_id", value === "none" ? null : value)
              }
            >
              <SelectTrigger className={`w-full rounded-lg ${inputClassName}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className={selectContentClassName}>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className={labelClassName}>
              Description
            </label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className={`resize-none ${inputClassName}`}
              placeholder="Short description..."
            />
          </div>

          {/* Intensity + Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>
                Intensity{" "}
                <span className={isLight ? "text-neutral-400" : "text-white/30"}>
                  ({String(form.intensity)})
                </span>
              </label>
              <Slider
                min="0"
                max="1"
                step="0.05"
                value={[Number(form.intensity)]}
                onValueChange={([value]) => set("intensity", value ?? 1)}
                className="py-3"
              />
            </div>
            <div>
              <label className={labelClassName}>
                Sort Order
              </label>
              <Input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => set("sort_order", e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelClassName}>
              Tags <span className={isLight ? "text-neutral-400" : "text-white/30"}>(comma-separated)</span>
            </label>
            <Input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={inputClassName}
              placeholder="warm, cinematic, dramatic"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6 pt-2">
            {toggleItems.map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Switch
                  checked={Boolean(form[key])}
                  onCheckedChange={(checked) => set(key, checked)}
                />
                <span
                  className={`text-sm font-body ${
                    isLight ? "text-neutral-600" : "text-white/60"
                  }`}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className={
              isLight
                ? "mt-2 w-full bg-neutral-950 text-white hover:bg-neutral-800"
                : "mt-2 w-full bg-white text-black hover:bg-white/90"
            }
          >
            <Save size={16} />
            {isNew ? "Create LUT" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
