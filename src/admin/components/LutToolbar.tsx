import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AdminTheme, Category, FilterStatus, ViewMode } from "../types";

type LutToolbarProps = {
  categories: Category[];
  filterCategory: string;
  filterStatus: FilterStatus;
  search: string;
  theme: AdminTheme;
  view: ViewMode;
  onAddLut: () => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onViewChange: (view: ViewMode) => void;
};

export default function LutToolbar({
  categories,
  filterCategory,
  filterStatus,
  search,
  theme,
  view,
  onAddLut,
  onCategoryChange,
  onSearchChange,
  onStatusChange,
  onViewChange,
}: LutToolbarProps) {
  const isLight = theme === "light";
  const selectClassName = isLight
    ? "h-8 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-neutral-300"
    : "h-8 rounded-lg border border-white/10 bg-[#111] px-3 text-sm text-white/70 outline-none focus:border-white/20";
  const toggleItemClassName = isLight
    ? "size-7 rounded text-neutral-400 data-[state=on]:bg-white data-[state=on]:text-neutral-950"
    : "size-7 rounded text-white/30 data-[state=on]:bg-white/10 data-[state=on]:text-white";

  return (
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
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search LUTs..."
          className={
            isLight
              ? "rounded-lg border-neutral-200 bg-white pl-8 text-neutral-950 placeholder:text-neutral-400 focus-visible:border-neutral-300 focus-visible:ring-neutral-200"
              : "rounded-lg border-white/10 bg-white/5 pl-8 text-white placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-white/10"
          }
        />
      </div>

      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={`w-40 ${selectClassName}`}
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
        className={`w-36 ${selectClassName}`}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="free">Free</option>
      </select>

      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(value) => value && onViewChange(value as ViewMode)}
        className={isLight ? "rounded-lg bg-neutral-100 p-1" : "rounded-lg bg-white/5 p-1"}
      >
        <ToggleGroupItem value="grid" aria-label="Grid view" className={toggleItemClassName}>
          <LayoutGrid size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view" className={toggleItemClassName}>
          <List size={14} />
        </ToggleGroupItem>
      </ToggleGroup>

      <Button
        onClick={onAddLut}
        className={
          isLight
            ? "bg-neutral-950 text-white hover:bg-neutral-800"
            : "bg-white text-black hover:bg-white/90"
        }
      >
        <Plus size={14} /> Add LUT
      </Button>
    </div>
  );
}
