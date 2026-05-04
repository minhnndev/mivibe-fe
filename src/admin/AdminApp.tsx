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
  Moon,
  Sun,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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
      !lut.filename.toLowerCase().includes(search.toLowerCase()) &&
      !(lut.slug ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleSaveLut = async (lut: LutInput) => {
    setLuts((items) =>
      items.map((item) => (item.id === lut.id ? { ...item, ...lut } : item)),
    );
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
  const isLight = theme === "light";

  return (
    <div className={isLight ? "light" : "dark"}>
    <div
      className={`min-h-screen font-body transition-colors ${
        isLight ? "bg-neutral-100 text-neutral-950" : "bg-[#0a0a0a] text-white"
      }`}
    >
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
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 flex flex-col z-20 transition-colors ${
          isLight
            ? "border-r border-neutral-200 bg-white"
            : "border-r border-white/5 bg-[#0d0d0d]"
        }`}
      >
        {/* Logo */}
        <div
          className={`p-6 ${
            isLight ? "border-b border-neutral-200" : "border-b border-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isLight ? "bg-black" : "bg-white"
              }`}
            >
              <span
                className={`font-heading italic text-sm font-bold ${
                  isLight ? "text-white" : "text-black"
                }`}
              >
                S
              </span>
            </div>
            <div>
              <p
                className={`font-heading italic text-base leading-tight ${
                  isLight ? "text-neutral-950" : "text-white"
                }`}
              >
                Mivibe
              </p>
              <p
                className={`text-xs font-body ${
                  isLight ? "text-neutral-500" : "text-white/30"
                }`}
              >
                Mivibe LUTs Admin
              </p>
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
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={`h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 ${
                activeTab === item.id
                  ? isLight
                    ? "bg-neutral-100 text-neutral-950"
                    : "bg-white/10 text-white"
                  : isLight
                    ? "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <Badge
                  className={`px-2 py-0.5 ${
                    isLight
                      ? "bg-neutral-200 text-neutral-500 hover:bg-neutral-200"
                      : "bg-white/10 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {item.count}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Stats */}
        <div
          className={`space-y-3 p-4 ${
            isLight ? "border-t border-neutral-200" : "border-t border-white/5"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-body">
            <span
              className={isLight ? "text-neutral-500" : "text-white/30"}
            >
              Theme
            </span>
            <label className="flex items-center gap-2">
              <Sun size={13} className={isLight ? "text-amber-500" : "text-white/25"} />
              <Switch
                checked={!isLight}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                size="sm"
              />
              <Moon size={13} className={isLight ? "text-neutral-400" : "text-sky-300"} />
            </label>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className={isLight ? "text-neutral-500" : "text-white/30"}>Active LUTs</span>
            <span className="text-emerald-400">{activeLuts}</span>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className={isLight ? "text-neutral-500" : "text-white/30"}>Supabase</span>
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
              <div
                className={`flex items-center gap-3 p-5 shrink-0 ${
                  isLight ? "border-b border-neutral-200 bg-white" : "border-b border-white/5"
                }`}
              >
                <div className="relative flex-1 max-w-xs">
                  <Search
                    size={14}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isLight ? "text-neutral-400" : "text-white/30"
                    }`}
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search LUTs..."
                    className={
                      isLight
                        ? "rounded-lg border-neutral-200 bg-white pl-8 text-neutral-950 placeholder:text-neutral-400 focus-visible:border-neutral-300 focus-visible:ring-neutral-200"
                        : "rounded-lg border-white/10 bg-white/5 pl-8 text-white placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-white/10"
                    }
                  />
                </div>

                {/* Category filter */}
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger
                    className={
                      isLight
                        ? "w-40 rounded-lg border-neutral-200 bg-white text-neutral-700 focus-visible:ring-neutral-200"
                        : "w-40 rounded-lg border-white/10 bg-white/5 text-white/70 focus-visible:ring-white/10"
                    }
                  >
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      isLight
                        ? "rounded-lg border-neutral-200 bg-white text-neutral-950 shadow-lg"
                        : "rounded-lg border-white/10 bg-[#111] text-white"
                    }
                  >
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select
                  value={filterStatus}
                  onValueChange={(value) => setFilterStatus(value as FilterStatus)}
                >
                  <SelectTrigger
                    className={
                      isLight
                        ? "w-36 rounded-lg border-neutral-200 bg-white text-neutral-700 focus-visible:ring-neutral-200"
                        : "w-36 rounded-lg border-white/10 bg-white/5 text-white/70 focus-visible:ring-white/10"
                    }
                  >
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      isLight
                        ? "rounded-lg border-neutral-200 bg-white text-neutral-950 shadow-lg"
                        : "rounded-lg border-white/10 bg-[#111] text-white"
                    }
                  >
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>

                <ToggleGroup
                  type="single"
                  value={view}
                  onValueChange={(value) => value && setView(value as ViewMode)}
                  className={
                    isLight ? "rounded-lg bg-neutral-100 p-1" : "rounded-lg bg-white/5 p-1"
                  }
                >
                  <ToggleGroupItem
                    value="grid"
                    aria-label="Grid view"
                    className={
                      isLight
                        ? "size-7 rounded text-neutral-400 data-[state=on]:bg-white data-[state=on]:text-neutral-950"
                        : "size-7 rounded text-white/30 data-[state=on]:bg-white/10 data-[state=on]:text-white"
                    }
                  >
                    <LayoutGrid size={14} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="list"
                    aria-label="List view"
                    className={
                      isLight
                        ? "size-7 rounded text-neutral-400 data-[state=on]:bg-white data-[state=on]:text-neutral-950"
                        : "size-7 rounded text-white/30 data-[state=on]:bg-white/10 data-[state=on]:text-white"
                    }
                  >
                    <List size={14} />
                  </ToggleGroupItem>
                </ToggleGroup>

                <Button
                  onClick={() => setEditModal({})}
                  className={
                    isLight
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "bg-white text-black hover:bg-white/90"
                  }
                >
                  <Plus size={14} /> Add LUT
                </Button>
              </div>

              {/* Preview image selector */}
              <div
                className={`flex items-center gap-2 px-5 py-2.5 shrink-0 ${
                  isLight
                    ? "border-b border-neutral-200 bg-neutral-50"
                    : "border-b border-white/5 bg-white/[0.02]"
                }`}
              >
                <Image size={13} className={isLight ? "text-neutral-400" : "text-white/30"} />
                <span className={isLight ? "text-neutral-500 text-xs" : "text-white/30 text-xs"}>Preview with:</span>
                {DEFAULT_IMAGES.map((img) => (
                  <Button
                    key={img.label}
                    variant="ghost"
                    size="xs"
                    onClick={() => setPreviewImage(img.url)}
                    className={`rounded-full px-2.5 py-1 ${
                      previewImage === img.url && !customImage
                        ? isLight
                          ? "bg-neutral-200 text-neutral-950"
                          : "bg-white/15 text-white"
                        : isLight
                          ? "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-950"
                          : "text-white/30 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {img.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-full px-2.5 py-1 ${
                    customImage
                      ? isLight
                        ? "bg-neutral-200 text-neutral-950"
                        : "bg-white/15 text-white"
                      : isLight
                        ? "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-950"
                        : "text-white/30 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Upload size={11} /> Custom
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomImageUpload}
                />
                <span className={isLight ? "text-neutral-400 text-xs ml-auto" : "text-white/20 text-xs ml-auto"}>
                  {filteredLuts.length} LUTs
                </span>
              </div>

              {/* Grid/List */}
              <div
                className={`flex-1 overflow-y-auto p-5 ${
                  isLight ? "bg-neutral-100" : ""
                }`}
              >
                {loading ? (
                  <div
                    className={`flex items-center justify-center h-64 text-sm ${
                      isLight ? "text-neutral-400" : "text-white/30"
                    }`}
                  >
                    Loading...
                  </div>
                ) : filteredLuts.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center h-64 gap-3 ${
                      isLight ? "text-neutral-400" : "text-white/20"
                    }`}
                  >
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
                          theme={theme}
                        />
                        {/* Action overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditModal(lut);
                              }}
                              className="bg-black/80 text-white/60 hover:bg-black/90 hover:text-white"
                            >
                              <Edit2 size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteLut(lut.id);
                              }}
                              className="bg-black/80 text-red-400/60 hover:bg-black/90 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                            </Button>
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
                              ? isLight
                                ? "border-neutral-300 bg-white shadow-sm"
                                : "border-white/20 bg-white/10"
                              : isLight
                                ? "border-neutral-200 bg-white/70 hover:bg-white"
                                : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              lut.is_active
                                ? "bg-emerald-400"
                                : isLight
                                  ? "bg-neutral-300"
                                  : "bg-white/20"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium truncate ${
                                  isLight ? "text-neutral-950" : "text-white"
                                }`}
                              >
                                {lut.name}
                              </span>
                              {lut.is_free && (
                              <Badge className="border-emerald-500/30 bg-transparent px-1.5 py-0.5 text-[10px] text-emerald-400 hover:bg-transparent">
                                Free
                              </Badge>
                            )}
                            </div>
                            <p
                              className={`text-xs ${
                                isLight ? "text-neutral-500" : "text-white/30"
                              }`}
                            >
                              {lut.filename}
                            </p>
                          </div>
                          {cat && (
                            <Badge
                              className={
                                isLight
                                  ? "bg-neutral-100 px-2.5 py-1 text-neutral-500 hover:bg-neutral-100"
                                  : "bg-white/5 px-2.5 py-1 text-white/30 hover:bg-white/5"
                              }
                            >
                              {cat.name}
                            </Badge>
                          )}
                          <span className={isLight ? "text-xs text-neutral-400" : "text-xs text-white/20"}>
                            ×{lut.intensity}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditModal(lut);
                              }}
                              className={
                                isLight
                                  ? "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
                                  : "text-white/30 hover:bg-white/5 hover:text-white"
                              }
                            >
                              <Edit2 size={13} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteLut(lut.id);
                              }}
                              className={
                                isLight
                                  ? "text-neutral-400 hover:bg-red-50 hover:text-red-500"
                                  : "text-white/30 hover:bg-red-500/10 hover:text-red-400"
                              }
                            >
                              <Trash2 size={13} />
                            </Button>
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
              <div
                className={`w-80 shrink-0 flex flex-col overflow-y-auto ${
                  isLight
                    ? "border-l border-neutral-200 bg-white"
                    : "border-l border-white/5"
                }`}
              >
                <div
                  className={`p-5 flex items-center justify-between ${
                    isLight ? "border-b border-neutral-200" : "border-b border-white/5"
                  }`}
                >
                  <h3
                    className={`font-heading italic text-lg ${
                      isLight ? "text-neutral-950" : "text-white"
                    }`}
                  >
                    LUT Detail
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedLut(null)}
                    className={
                      isLight
                        ? "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
                        : "text-white/30 hover:bg-white/5 hover:text-white"
                    }
                  >
                    ✕
                  </Button>
                </div>
                <div className="p-5 space-y-5">
                  {/* Large preview */}
                    <LutPreviewCard
                      lut={selectedLut}
                      previewImage={previewImage}
                      showBadge={false}
                      theme={theme}
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
                        <span className={isLight ? "text-neutral-500" : "text-white/30"}>{k}</span>
                        <span className={isLight ? "text-neutral-800" : "text-white/70"}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {selectedLut.description && (
                    <p
                      className={`text-xs leading-relaxed border-t pt-4 ${
                        isLight
                          ? "border-neutral-200 text-neutral-500"
                          : "border-white/5 text-white/40"
                      }`}
                    >
                      {selectedLut.description}
                    </p>
                  )}

                  {selectedLut.tags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedLut.tags.map((t) => (
                            <Badge
                              key={t}
                              className={
                                isLight
                                  ? "bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
                                  : "bg-white/5 px-2.5 py-1 text-xs text-white/30 hover:bg-white/5"
                              }
                            >
                              #{t}
                            </Badge>
                          ))}
                    </div>
                  ) : null}

                  <Button
                    variant="outline"
                    onClick={() => setEditModal(selectedLut)}
                    className={
                      isLight
                        ? "w-full border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
                        : "w-full border-white/10 bg-transparent text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white"
                    }
                  >
                    <Edit2 size={14} /> Edit LUT
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Categories ──────────────────────────────────────── */}
        {activeTab === "categories" && (
          <div className="p-8 max-w-2xl">
            <h1
              className={`font-heading italic text-3xl mb-2 ${
                isLight ? "text-neutral-950" : "text-white"
              }`}
            >
              Categories
            </h1>
            <p
              className={`text-sm font-body mb-8 ${
                isLight ? "text-neutral-500" : "text-white/40"
              }`}
            >
              Organize your LUTs into collections for the mobile app.
            </p>
            <CategoryManager
              categories={categories}
              luts={luts}
              onSave={handleSaveCategory}
              onDelete={handleDeleteCategory}
              theme={theme}
            />
          </div>
        )}

        {/* ── Export & API ─────────────────────────────────────── */}
        {activeTab === "export" && (
          <div className="p-8 max-w-3xl space-y-8">
            <div>
              <h1
                className={`font-heading italic text-3xl mb-2 ${
                  isLight ? "text-neutral-950" : "text-white"
                }`}
              >
                Export & Remote Update
              </h1>
              <p
                className={`text-sm font-body ${
                  isLight ? "text-neutral-500" : "text-white/40"
                }`}
              >
                Export a manifest JSON for mobile apps to fetch LUT updates
                remotely.
              </p>
            </div>

            {/* Supabase status */}
            <Alert
              className={`rounded-2xl p-6 border ${
                isConfigured
                  ? isLight
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-emerald-500/20 bg-emerald-900/10"
                  : isLight
                    ? "border-orange-200 bg-orange-50"
                    : "border-orange-500/20 bg-orange-900/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {isConfigured ? (
                  <CheckCircle size={18} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={18} className="text-orange-400" />
                )}
                <h3
                  className={`font-body font-medium text-sm ${
                    isConfigured
                      ? isLight
                        ? "text-emerald-700"
                        : "text-emerald-300"
                      : isLight
                        ? "text-orange-700"
                        : "text-orange-300"
                  }`}
                >
                  {isConfigured
                    ? "Supabase Connected"
                    : "Supabase Not Configured"}
                </h3>
              </div>
              {!isConfigured && (
                <div className="space-y-2">
                  <p className={isLight ? "text-orange-700/70 text-xs font-body" : "text-orange-200/60 text-xs font-body"}>
                    Add these to your{" "}
                    <code className={isLight ? "text-orange-700" : "text-orange-300"}>.env</code> file:
                  </p>
                  <pre className={isLight ? "bg-white rounded-lg p-3 text-xs text-orange-800/70 font-mono" : "bg-black/40 rounded-lg p-3 text-xs text-orange-200/70 font-mono"}>
                    {`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`}
                  </pre>
                  <p className={isLight ? "text-orange-700/60 text-xs font-body" : "text-orange-200/50 text-xs font-body"}>
                    Data is currently stored in localStorage only.
                  </p>
                </div>
              )}
            </Alert>

            {/* Export manifest */}
            <Card
              className={
                isLight
                  ? "space-y-4 border-neutral-200 bg-white p-6 text-neutral-950 shadow-sm"
                  : "space-y-4 border-white/10 bg-white/[0.03] p-6 text-white"
              }
            >
              <h3 className={isLight ? "text-neutral-950 font-body font-medium" : "text-white font-body font-medium"}>
                Mobile Manifest JSON
              </h3>
              <p className={isLight ? "text-neutral-500 text-xs leading-relaxed" : "text-white/40 text-xs leading-relaxed"}>
                Export a{" "}
                <code className={isLight ? "text-neutral-700" : "text-white/60"}>luts-manifest.json</code> file
                containing all active LUTs with their metadata. Host this file
                on your CDN and have your mobile app poll it for updates.
              </p>
              <div className={isLight ? "bg-neutral-100 rounded-xl p-4 text-xs font-mono text-neutral-500 space-y-1" : "bg-black/40 rounded-xl p-4 text-xs font-mono text-white/50 space-y-1"}>
                <div>
                  <span className="text-blue-400">GET</span>{" "}
                  <span className={isLight ? "text-neutral-400" : "text-white/30"}>https://cdn.mivibe.app/</span>
                  <span className="text-emerald-400">luts-manifest.json</span>
                </div>
                <div className={isLight ? "mt-2 text-neutral-400" : "mt-2 text-white/20"}>
                  // Mobile app checks version field to detect updates
                </div>
              </div>
              <Button
                onClick={() => void handleExportManifest()}
                className={
                  isLight
                    ? "bg-neutral-950 text-white hover:bg-neutral-800"
                    : "bg-white text-black hover:bg-white/90"
                }
              >
                <Download size={16} /> Export Manifest
              </Button>
            </Card>

            {/* Supabase REST API */}
            <Card
              className={
                isLight
                  ? "space-y-4 border-neutral-200 bg-white p-6 text-neutral-950 shadow-sm"
                  : "space-y-4 border-white/10 bg-white/[0.03] p-6 text-white"
              }
            >
              <h3 className={isLight ? "text-neutral-950 font-body font-medium" : "text-white font-body font-medium"}>
                Supabase REST API
              </h3>
              <p className={isLight ? "text-neutral-500 text-xs leading-relaxed" : "text-white/40 text-xs leading-relaxed"}>
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
                  <div key={i} className={isLight ? "bg-neutral-100 rounded-xl p-3 space-y-1" : "bg-black/40 rounded-xl p-3 space-y-1"}>
                    <div className="text-xs font-mono">
                      <span className="text-blue-400">{api.method}</span>{" "}
                      <span className="text-emerald-400 break-all">
                        {api.path}
                      </span>
                    </div>
                    <p className={isLight ? "text-neutral-500 text-[11px]" : "text-white/30 text-[11px]"}>{api.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Preview manifest */}
            {manifest && (
              <Card
                className={
                  isLight
                    ? "space-y-4 border-neutral-200 bg-white p-6 text-neutral-950 shadow-sm"
                    : "space-y-4 border-white/10 bg-white/[0.03] p-6 text-white"
                }
              >
                <h3 className={isLight ? "text-neutral-950 font-body font-medium text-sm" : "text-white font-body font-medium text-sm"}>
                  Last Export Preview
                </h3>
                <pre className={isLight ? "bg-neutral-100 rounded-xl p-4 text-xs text-neutral-600 overflow-x-auto max-h-64 overflow-y-auto font-mono" : "bg-black/60 rounded-xl p-4 text-xs text-white/50 overflow-x-auto max-h-64 overflow-y-auto font-mono"}>
                  {JSON.stringify(manifest, null, 2)}
                </pre>
              </Card>
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
          theme={theme}
        />
      )}
    </div>
    </div>
  );
}
