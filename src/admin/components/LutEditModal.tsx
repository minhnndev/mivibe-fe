import { useState } from "react";
import { X, Save } from "lucide-react";
import { KNOWN_CUBE_FILES } from "../store";
import type { Category, Lut, LutInput } from "../types";

type LutEditModalProps = {
  lut: Partial<Lut> | null;
  categories: Category[];
  onSave: (lut: LutInput) => void;
  onClose: () => void;
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
}: LutEditModalProps) {
  const isNew = !lut?.id;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-heading italic text-xl">
            {isNew ? "Add LUT" : "Edit LUT"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Name */}
          <div>
            <label className="text-white/60 text-xs font-body mb-1.5 block">
              Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-white/30"
              placeholder="Cinematic Warm"
            />
          </div>

          {/* Filename */}
          <div>
            <label className="text-white/60 text-xs font-body mb-1.5 block">
              LUT File *
            </label>
            <select
              required
              value={form.filename}
              onChange={(e) => {
                set("filename", e.target.value);
                set("storage_key", e.target.value);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-white/30"
            >
              {KNOWN_CUBE_FILES.map((f) => (
                <option key={f} value={f} style={{ background: "#111" }}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-white/60 text-xs font-body mb-1.5 block">
              Category
            </label>
            <select
              value={form.category_id || ""}
              onChange={(e) => set("category_id", e.target.value || null)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-white/30"
            >
              <option value="" style={{ background: "#111" }}>
                — No Category —
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#111" }}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/60 text-xs font-body mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-white/30 resize-none"
              placeholder="Short description..."
            />
          </div>

          {/* Intensity + Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs font-body mb-1.5 block">
                Intensity{" "}
                <span className="text-white/30">
                  ({String(form.intensity)})
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.intensity}
                onChange={(e) => set("intensity", e.target.value)}
                className="w-full accent-white"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-body mb-1.5 block">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => set("sort_order", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-white/60 text-xs font-body mb-1.5 block">
              Tags <span className="text-white/30">(comma-separated)</span>
            </label>
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-white/30"
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
                <div
                  onClick={() => set(key, !form[key])}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    form[key] ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all ${
                      form[key] ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </div>
                <span className="text-white/60 text-sm font-body">{label}</span>
              </label>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-xl py-2.5 font-body font-medium text-sm hover:bg-white/90 transition-colors mt-2"
          >
            <Save size={16} />
            {isNew ? "Create LUT" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
