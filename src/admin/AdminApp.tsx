import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  Download,
  Search,
  Trash2,
  Edit2,
  Tag,
  Upload,
  Image,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";
import {
  getLuts,
  getCategories,
  saveLut,
  deleteLut,
  saveCategory,
  deleteCategory,
  generateManifest,
} from "./store";
import LutPreviewCard from "./components/LutPreviewCard";
import LutEditModal from "./components/LutEditModal";
import CategoryManager from "./components/CategoryManager";
import { isConfigured } from "./supabase";
import type { Category, CategoryInput, Lut, LutInput, Manifest } from "./types";

const DEFAULT_IMAGES: Array<{ label: string; url: string }> = [
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

type ViewMode = "grid" | "list";
type ActiveTab = "luts" | "categories" | "export";
type FilterStatus = "all" | "active" | "inactive" | "free";
type Toast = { msg: string; type: "success" | "error" };

export default function AdminApp() {
  const [luts, setLuts] = useState<Lut[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<ActiveTab>("luts");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedLut, setSelectedLut] = useState<Lut | null>(null);
  const [editModal, setEditModal] = useState<Partial<Lut> | null>(null);
  const [previewImage, setPreviewImage] = useState(DEFAULT_IMAGES[0]!.url);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string, type: Toast["type"] = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const reload = useCallback(async () => {
    setLoading(true);
    const [l, c] = await Promise.all([getLuts(), getCategories()]);
    setLuts(l);
    setCategories(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Filtered LUTs
  const filteredLuts = luts.filter((lut) => {
    if (filterCategory !== "all" && lut.category_id !== filterCategory)
      return false;
    if (filterStatus === "active" && !lut.is_active) return false;
    if (filterStatus === "inactive" && lut.is_active) return false;
    if (filterStatus === "free" && !lut.is_free) return false;
    if (
      search &&
      !lut.name.toLowerCase().includes(search.toLowerCase()) &&
      !lut.filename.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleSaveLut = async (lut: LutInput) => {
    const updated = await saveLut(lut);
    setLuts(updated);
    setEditModal(null);
    showToast(lut.id ? "LUT updated" : "LUT created");
  };

  const handleDeleteLut = async (id: string) => {
    if (!confirm("Delete this LUT?")) return;
    const updated = await deleteLut(id);
    setLuts(updated);
    if (selectedLut?.id === id) setSelectedLut(null);
    showToast("LUT deleted", "error");
  };

  const handleSaveCategory = async (cat: CategoryInput) => {
    const updated = await saveCategory(cat);
    setCategories(updated);
    showToast("Category saved");
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const updated = await deleteCategory(id);
    setCategories(updated);
    showToast("Category deleted", "error");
  };

  const handleExportManifest = async () => {
    const data = await generateManifest();
    setManifest(data);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luts-manifest-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Manifest exported!");
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomImage(url);
    setPreviewImage(url);
  };

  const activeLuts = luts.filter((l) => l.is_active).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-body">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body shadow-xl transition-all
          ${
            toast.type === "error"
              ? "bg-red-900/80 text-red-200 border border-red-700/50"
              : "bg-emerald-900/80 text-emerald-200 border border-emerald-700/50"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col z-20">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
              <span className="text-black font-heading italic text-sm font-bold">
                S
              </span>
            </div>
            <div>
              <p className="text-white font-heading italic text-base leading-tight">
                Mivibe
              </p>
              <p className="text-white/30 text-xs font-body">Mivibe LUTs Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            {
              id: "luts" as const,
              icon: Layers,
              label: "LUT Library",
              count: luts.length,
            },
            {
              id: "categories" as const,
              icon: Tag,
              label: "Categories",
              count: categories.length,
            },
            { id: "export" as const, icon: Download, label: "Export & API" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/50">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex justify-between text-xs font-body">
            <span className="text-white/30">Active LUTs</span>
            <span className="text-emerald-400">{activeLuts}</span>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className="text-white/30">Supabase</span>
            <span
              className={isConfigured ? "text-emerald-400" : "text-orange-400"}
            >
              {isConfigured ? "Connected" : "Local only"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* ── LUT Library ─────────────────────────────────────── */}
        {activeTab === "luts" && (
          <div className="flex h-screen overflow-hidden">
            {/* LUT List Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-3 p-5 border-b border-white/5 shrink-0">
                <div className="relative flex-1 max-w-xs">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search LUTs..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20"
                  />
                </div>

                {/* Category filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none"
                  style={{ background: "#111" }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none"
                  style={{ background: "#111" }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="free">Free</option>
                </select>

                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-1.5 rounded ${
                      view === "grid"
                        ? "bg-white/10 text-white"
                        : "text-white/30"
                    }`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-1.5 rounded ${
                      view === "list"
                        ? "bg-white/10 text-white"
                        : "text-white/30"
                    }`}
                  >
                    <List size={14} />
                  </button>
                </div>

                <button
                  onClick={() => setEditModal({})}
                  className="flex items-center gap-2 bg-white text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  <Plus size={14} /> Add LUT
                </button>
              </div>

              {/* Preview image selector */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.02] border-b border-white/5 shrink-0">
                <Image size={13} className="text-white/30" />
                <span className="text-white/30 text-xs">Preview with:</span>
                {DEFAULT_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    onClick={() => setPreviewImage(img.url)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                      previewImage === img.url && !customImage
                        ? "bg-white/15 text-white"
                        : "text-white/30 hover:text-white"
                    }`}
                  >
                    {img.label}
                  </button>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                    customImage
                      ? "bg-white/15 text-white"
                      : "text-white/30 hover:text-white"
                  }`}
                >
                  <Upload size={11} /> Custom
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomImageUpload}
                />
                <span className="text-white/20 text-xs ml-auto">
                  {filteredLuts.length} LUTs
                </span>
              </div>

              {/* Grid/List */}
              <div className="flex-1 overflow-y-auto p-5">
                {loading ? (
                  <div className="flex items-center justify-center h-64 text-white/30 text-sm">
                    Loading...
                  </div>
                ) : filteredLuts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/20">
                    <Layers size={32} />
                    <p className="text-sm">No LUTs found</p>
                  </div>
                ) : view === "grid" ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredLuts.map((lut) => (
                      <div key={lut.id} className="relative group">
                        <LutPreviewCard
                          lut={lut}
                          previewImage={previewImage}
                          selected={selectedLut?.id === lut.id}
                          onClick={() => setSelectedLut(lut)}
                        />
                        {/* Action overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditModal(lut);
                            }}
                            className="w-7 h-7 bg-black/80 rounded-lg flex items-center justify-center text-white/60 hover:text-white"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDeleteLut(lut.id);
                            }}
                            className="w-7 h-7 bg-black/80 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-2">
                    {filteredLuts.map((lut) => {
                      const cat = categories.find(
                        (c) => c.id === lut.category_id,
                      );
                      return (
                        <div
                          key={lut.id}
                          onClick={() => setSelectedLut(lut)}
                          className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${
                            selectedLut?.id === lut.id
                              ? "border-white/20 bg-white/10"
                              : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              lut.is_active ? "bg-emerald-400" : "bg-white/20"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-medium truncate">
                                {lut.name}
                              </span>
                              {lut.is_free && (
                                <span className="text-[10px] text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0.5">
                                  Free
                                </span>
                              )}
                            </div>
                            <p className="text-white/30 text-xs">
                              {lut.filename}
                            </p>
                          </div>
                          {cat && (
                            <span className="text-xs text-white/30 bg-white/5 rounded-full px-2.5 py-1">
                              {cat.name}
                            </span>
                          )}
                          <span className="text-xs text-white/20">
                            ×{lut.intensity}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditModal(lut);
                              }}
                              className="p-1.5 text-white/30 hover:text-white transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteLut(lut.id);
                              }}
                              className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Detail Panel */}
            {selectedLut && (
              <div className="w-80 shrink-0 border-l border-white/5 flex flex-col overflow-y-auto">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white font-heading italic text-lg">
                    LUT Detail
                  </h3>
                  <button
                    onClick={() => setSelectedLut(null)}
                    className="text-white/30 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  {/* Large preview */}
                  <LutPreviewCard
                    lut={selectedLut}
                    previewImage={previewImage}
                    showBadge={false}
                  />

                  {/* Info */}
                  <div className="space-y-3">
                    {(
                      [
                        ["File", selectedLut.filename],
                        [
                          "Category",
                          categories.find(
                            (c) => c.id === selectedLut.category_id,
                          )?.name || "—",
                        ],
                        [
                          "Intensity",
                          `${Math.round(selectedLut.intensity * 100)}%`,
                        ],
                        ["Sort Order", selectedLut.sort_order],
                        [
                          "Status",
                          selectedLut.is_active ? "Active" : "Inactive",
                        ],
                        ["Access", selectedLut.is_free ? "Free" : "Premium"],
                      ] satisfies Array<[string, ReactNode]>
                    ).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-white/30">{k}</span>
                        <span className="text-white/70">{v}</span>
                      </div>
                    ))}
                  </div>

                  {selectedLut.description && (
                    <p className="text-white/40 text-xs leading-relaxed border-t border-white/5 pt-4">
                      {selectedLut.description}
                    </p>
                  )}

                  {selectedLut.tags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedLut.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-white/5 text-white/30 rounded-full px-2.5 py-1"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <button
                    onClick={() => setEditModal(selectedLut)}
                    className="w-full flex items-center justify-center gap-2 border border-white/10 rounded-xl py-2.5 text-white/60 hover:text-white hover:border-white/20 transition-colors text-sm"
                  >
                    <Edit2 size={14} /> Edit LUT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Categories ──────────────────────────────────────── */}
        {activeTab === "categories" && (
          <div className="p-8 max-w-2xl">
            <h1 className="text-white font-heading italic text-3xl mb-2">
              Categories
            </h1>
            <p className="text-white/40 text-sm font-body mb-8">
              Organize your LUTs into collections for the mobile app.
            </p>
            <CategoryManager
              categories={categories}
              luts={luts}
              onSave={handleSaveCategory}
              onDelete={handleDeleteCategory}
            />
          </div>
        )}

        {/* ── Export & API ─────────────────────────────────────── */}
        {activeTab === "export" && (
          <div className="p-8 max-w-3xl space-y-8">
            <div>
              <h1 className="text-white font-heading italic text-3xl mb-2">
                Export & Remote Update
              </h1>
              <p className="text-white/40 text-sm font-body">
                Export a manifest JSON for mobile apps to fetch LUT updates
                remotely.
              </p>
            </div>

            {/* Supabase status */}
            <div
              className={`rounded-2xl p-6 border ${
                isConfigured
                  ? "border-emerald-500/20 bg-emerald-900/10"
                  : "border-orange-500/20 bg-orange-900/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {isConfigured ? (
                  <CheckCircle size={18} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={18} className="text-orange-400" />
                )}
                <h3
                  className={`font-body font-medium text-sm ${
                    isConfigured ? "text-emerald-300" : "text-orange-300"
                  }`}
                >
                  {isConfigured
                    ? "Supabase Connected"
                    : "Supabase Not Configured"}
                </h3>
              </div>
              {!isConfigured && (
                <div className="space-y-2">
                  <p className="text-orange-200/60 text-xs font-body">
                    Add these to your{" "}
                    <code className="text-orange-300">.env</code> file:
                  </p>
                  <pre className="bg-black/40 rounded-lg p-3 text-xs text-orange-200/70 font-mono">
                    {`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`}
                  </pre>
                  <p className="text-orange-200/50 text-xs font-body">
                    Data is currently stored in localStorage only.
                  </p>
                </div>
              )}
            </div>

            {/* Export manifest */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-body font-medium">
                📦 Mobile Manifest JSON
              </h3>
              <p className="text-white/40 text-xs leading-relaxed">
                Export a{" "}
                <code className="text-white/60">luts-manifest.json</code> file
                containing all active LUTs with their metadata. Host this file
                on your CDN and have your mobile app poll it for updates.
              </p>
              <div className="bg-black/40 rounded-xl p-4 text-xs font-mono text-white/50 space-y-1">
                <div>
                  <span className="text-blue-400">GET</span>{" "}
                  <span className="text-white/30">https://yourcdn.com/</span>
                  <span className="text-emerald-400">luts-manifest.json</span>
                </div>
                <div className="mt-2 text-white/20">
                  // Mobile app checks version field to detect updates
                </div>
              </div>
              <button
                onClick={() => void handleExportManifest()}
                className="flex items-center gap-2 bg-white text-black rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors"
              >
                <Download size={16} /> Export Manifest
              </button>
            </div>

            {/* Supabase REST API */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-body font-medium">
                🔌 Supabase REST API
              </h3>
              <p className="text-white/40 text-xs leading-relaxed">
                When Supabase is configured, mobile apps can fetch LUTs directly
                via the REST API:
              </p>
              <div className="space-y-3">
                {[
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
                ].map((api, i) => (
                  <div key={i} className="bg-black/40 rounded-xl p-3 space-y-1">
                    <div className="text-xs font-mono">
                      <span className="text-blue-400">{api.method}</span>{" "}
                      <span className="text-emerald-400 break-all">
                        {api.path}
                      </span>
                    </div>
                    <p className="text-white/30 text-[11px]">{api.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview manifest */}
            {manifest && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-body font-medium text-sm">
                  Last Export Preview
                </h3>
                <pre className="bg-black/60 rounded-xl p-4 text-xs text-white/50 overflow-x-auto max-h-64 overflow-y-auto font-mono">
                  {JSON.stringify(manifest, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal !== null && (
        <LutEditModal
          lut={editModal}
          categories={categories}
          onSave={handleSaveLut}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}
