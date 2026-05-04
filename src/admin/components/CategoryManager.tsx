import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Category, CategoryInput, Lut } from "../types";

type CategoryManagerProps = {
  categories: Category[];
  luts: Lut[];
  onSave: (cat: CategoryInput) => void;
  onDelete: (id: string) => void;
  theme?: "dark" | "light";
};

export default function CategoryManager({
  categories,
  luts,
  onSave,
  onDelete,
  theme = "dark",
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<CategoryInput>({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ ...cat });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const submitEdit = () => {
    if (!editingId) return;
    if (!form.name) return;
    onSave({
      id: editingId,
      name: form.name,
      slug: form.slug ?? form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description ?? "",
      sort_order: form.sort_order ?? 0,
    });
    cancelEdit();
  };

  const submitNew = () => {
    if (!newForm.name) return;
    onSave({
      ...newForm,
      slug: newForm.slug || newForm.name.toLowerCase().replace(/\s+/g, "-"),
    });
    setNewForm({ name: "", slug: "", description: "", sort_order: 0 });
    setShowNew(false);
  };

  const getLutCount = (catId: string) =>
    luts.filter((l) => l.category_id === catId).length;
  const isLight = theme === "light";

  const inputClassName = isLight
    ? "border-neutral-200 bg-white text-neutral-950 placeholder:text-neutral-400 focus-visible:ring-neutral-300"
    : "border-white/20 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-white/10";

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <Card
          key={cat.id}
          className={
            isLight
              ? "border-neutral-200 bg-white p-4 text-neutral-950 shadow-sm"
              : "border-white/10 bg-white/5 p-4 text-white"
          }
        >
          {editingId === cat.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={inputClassName}
                  placeholder="Name"
                />
                <Input
                  value={form.slug ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  className={inputClassName}
                  placeholder="slug"
                />
              </div>
              <Input
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className={inputClassName}
                placeholder="Description"
              />
              <div className="flex gap-2">
                <Button
                  onClick={submitEdit}
                  size="sm"
                  className={
                    isLight
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "bg-white text-black hover:bg-white/90"
                  }
                >
                  <Save size={12} /> Save
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="ghost"
                  size="sm"
                  className={
                    isLight
                      ? "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }
                >
                  <X size={12} /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-body font-medium text-sm ${
                      isLight ? "text-neutral-950" : "text-white"
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span
                    className={`text-xs font-body ${
                      isLight ? "text-neutral-400" : "text-white/30"
                    }`}
                  >
                    /{cat.slug}
                  </span>
                  <Badge
                    className={
                      isLight
                        ? "border-neutral-200 bg-neutral-100 text-neutral-500 hover:bg-neutral-100"
                        : "border-white/10 bg-white/10 text-white/50 hover:bg-white/10"
                    }
                  >
                    {getLutCount(cat.id)} LUTs
                  </Badge>
                </div>
                {cat.description ? (
                  <p
                    className={`text-xs font-body mt-0.5 ${
                      isLight ? "text-neutral-500" : "text-white/40"
                    }`}
                  >
                    {cat.description}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => startEdit(cat)}
                  variant="ghost"
                  size="icon-sm"
                  className={
                    isLight
                      ? "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
                      : "text-white/30 hover:bg-white/5 hover:text-white"
                  }
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  onClick={() => onDelete(cat.id)}
                  variant="ghost"
                  size="icon-sm"
                  className={
                    isLight
                      ? "text-neutral-400 hover:bg-red-50 hover:text-red-500"
                      : "text-white/30 hover:bg-red-500/10 hover:text-red-400"
                  }
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}

      {showNew ? (
        <Card
          className={
            isLight
              ? "space-y-3 border-neutral-300 border-dashed bg-white p-4 text-neutral-950 shadow-sm"
              : "space-y-3 border-white/20 border-dashed bg-white/5 p-4 text-white"
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              autoFocus
              value={newForm.name}
              onChange={(e) =>
                setNewForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                }))
              }
              className={inputClassName}
              placeholder="Category name *"
            />
            <Input
              value={newForm.slug}
              onChange={(e) =>
                setNewForm((f) => ({ ...f, slug: e.target.value }))
              }
              className={inputClassName}
              placeholder="slug"
            />
          </div>
          <Input
            value={newForm.description ?? ""}
            onChange={(e) =>
              setNewForm((f) => ({ ...f, description: e.target.value }))
            }
            className={inputClassName}
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <Button
              onClick={submitNew}
              size="sm"
              className={
                isLight
                  ? "bg-neutral-950 text-white hover:bg-neutral-800"
                  : "bg-white text-black hover:bg-white/90"
              }
            >
              <Save size={12} /> Create
            </Button>
            <Button
              onClick={() => setShowNew(false)}
              variant="ghost"
              size="sm"
              className={
                isLight
                  ? "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setShowNew(true)}
          variant="outline"
          className={
            isLight
              ? "h-12 w-full border-neutral-300 border-dashed bg-white text-neutral-500 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-950"
              : "h-12 w-full border-white/10 border-dashed bg-transparent text-white/40 hover:border-white/30 hover:bg-white/5 hover:text-white"
          }
        >
          <Plus size={16} /> Add Category
        </Button>
      )}
    </div>
  );
}
