import type { Category, FilterStatus, Lut } from "./types";

export function filterLuts(
  luts: Lut[],
  filters: {
    categoryId: string;
    status: FilterStatus;
    search: string;
  },
) {
  const query = filters.search.trim().toLowerCase();

  return luts.filter((lut) => {
    if (filters.categoryId !== "all" && lut.category_id !== filters.categoryId) {
      return false;
    }
    if (filters.status === "active" && !lut.is_active) return false;
    if (filters.status === "inactive" && lut.is_active) return false;
    if (filters.status === "free" && !lut.is_free) return false;
    if (!query) return true;

    return [lut.name, lut.filename, lut.slug ?? ""].some((value) =>
      value.toLowerCase().includes(query),
    );
  });
}

export function getCategoryName(categories: Category[], categoryId?: string | null) {
  return categories.find((category) => category.id === categoryId)?.name ?? "—";
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
