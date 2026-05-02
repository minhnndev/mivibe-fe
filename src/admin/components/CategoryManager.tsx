import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import type { Category, CategoryInput, Lut } from "../types";

type CategoryManagerProps = {
  categories: Category[];
  luts: Lut[];
  onSave: (cat: CategoryInput) => void;
  onDelete: (id: string) => void;
};

export default function CategoryManager({
  categories,
  luts,
  onSave,
  onDelete,
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

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          {editingId === cat.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-body focus:outline-none"
                  placeholder="Name"
                />
                <input
                  value={form.slug ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-body focus:outline-none"
                  placeholder="slug"
                />
              </div>
              <input
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-body focus:outline-none"
                placeholder="Description"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitEdit}
                  className="flex items-center gap-1.5 bg-white text-black rounded-lg px-3 py-1.5 text-xs font-body font-medium"
                >
                  <Save size={12} /> Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-body transition-colors px-2"
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-body font-medium text-sm">
                    {cat.name}
                  </span>
                  <span className="text-white/30 text-xs font-body">
                    /{cat.slug}
                  </span>
                  <span className="text-xs bg-white/10 text-white/50 rounded-full px-2 py-0.5 font-body">
                    {getLutCount(cat.id)} LUTs
                  </span>
                </div>
                {cat.description ? (
                  <p className="text-white/40 text-xs font-body mt-0.5">
                    {cat.description}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(cat)}
                  className="text-white/30 hover:text-white transition-colors p-1.5"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(cat.id)}
                  className="text-white/30 hover:text-red-400 transition-colors p-1.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showNew ? (
        <div className="bg-white/5 border border-white/20 border-dashed rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              autoFocus
              value={newForm.name}
              onChange={(e) =>
                setNewForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                }))
              }
              className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-body focus:outline-none"
              placeholder="Category name *"
            />
            <input
              value={newForm.slug}
              onChange={(e) =>
                setNewForm((f) => ({ ...f, slug: e.target.value }))
              }
              className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-body focus:outline-none"
              placeholder="slug"
            />
          </div>
          <input
            value={newForm.description ?? ""}
            onChange={(e) =>
              setNewForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-body focus:outline-none"
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <button
              onClick={submitNew}
              className="flex items-center gap-1.5 bg-white text-black rounded-lg px-3 py-1.5 text-xs font-body font-medium"
            >
              <Save size={12} /> Create
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="text-white/40 hover:text-white text-xs font-body transition-colors px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full flex items-center justify-center gap-2 border border-white/10 border-dashed rounded-xl py-3 text-white/40 hover:text-white hover:border-white/30 transition-colors text-sm font-body"
        >
          <Plus size={16} /> Add Category
        </button>
      )}
    </div>
  );
}
