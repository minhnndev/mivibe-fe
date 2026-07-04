import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Download, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createId, validateRemoteConfig } from "../remoteConfigUtils";
import type {
  AdminTheme,
  LutPackage,
  RemoteCategory,
  RemoteConfig,
  RemoteConfigSelection,
  RemoteLut,
} from "../types";

type RemoteConfigManagerProps = {
  config: RemoteConfig;
  theme: AdminTheme;
  onSave: (config: RemoteConfig) => void;
  onExport: (config: RemoteConfig) => void;
  onResetFromLuts: () => void;
};

type TreeNodeData = {
  title: string;
  subtitle: string;
  status?: string;
  selected: boolean;
  tone: "root" | "category" | "package";
  isLight: boolean;
};

function TreeNode({ data }: NodeProps<Node<TreeNodeData>>) {
  const toneClass =
    data.tone === "root"
      ? data.isLight
        ? "border-purple-200 bg-purple-50"
        : "border-purple-400/50 bg-purple-500/15"
      : data.tone === "category"
        ? data.isLight
          ? "border-sky-200 bg-sky-50"
          : "border-sky-400/50 bg-sky-500/15"
        : data.isLight
          ? "border-emerald-200 bg-emerald-50"
          : "border-emerald-400/50 bg-emerald-500/15";
  const titleClassName = data.isLight ? "text-neutral-950" : "text-white";
  const subtitleClassName = data.isLight ? "text-neutral-600" : "text-white/65";
  const statusClassName = data.isLight ? "text-neutral-500" : "text-white/45";
  const selectedClassName = data.isLight ? "ring-2 ring-neutral-950/40" : "ring-2 ring-white/70";

  return (
    <div
      className={`min-w-44 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${toneClass} ${
        data.selected ? selectedClassName : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className={`text-sm font-semibold ${titleClassName}`}>{data.title}</div>
      <div className={`mt-1 text-xs ${subtitleClassName}`}>{data.subtitle}</div>
      {data.status ? (
        <div className={`mt-2 text-[10px] uppercase tracking-widest ${statusClassName}`}>
          {data.status}
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}

const nodeTypes = { treeNode: TreeNode };

export default function RemoteConfigManager({
  config,
  theme,
  onSave,
  onExport,
  onResetFromLuts,
}: RemoteConfigManagerProps) {
  const [draft, setDraft] = useState(config);
  const [selection, setSelection] = useState<RemoteConfigSelection>({
    type: "root",
    id: "root",
  });
  const [lutSearch, setLutSearch] = useState("");
  const [lutToneFilter, setLutToneFilter] = useState("all");
  const [lutStyleFilter, setLutStyleFilter] = useState("all");
  const [lutStatusFilter, setLutStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const isLight = theme === "light";
  const errors = validateRemoteConfig(draft);

  const selectedCategory =
    selection.type === "category"
      ? draft.categories.find((item) => item.id === selection.id)
      : null;
  const selectedPackage =
    selection.type === "package"
      ? draft.packages.find((item) => item.id === selection.id)
      : null;

  const inputClassName = isLight
    ? "border-neutral-200 bg-white text-neutral-950 placeholder:text-neutral-400 focus-visible:ring-neutral-300"
    : "border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-white/10";
  const selectClassName = isLight
    ? "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none"
    : "h-9 rounded-lg border border-white/10 bg-[#111] px-3 text-sm text-white outline-none";
  const labelClassName = isLight
    ? "mb-1.5 block text-xs text-neutral-500"
    : "mb-1.5 block text-xs text-white/45";
  const badgeClassName = isLight
    ? "border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-100"
    : "border-white/10 bg-white/10 text-white/60 hover:bg-white/10";

  const { nodes, edges } = useMemo(
    () => buildFlow(draft, selection, isLight),
    [draft, isLight, selection],
  );

  const packageCategoryId = selectedPackage
    ? draft.categories.find((category) =>
        category.packageIds.includes(selectedPackage.id),
      )?.id ?? ""
    : "";

  const packageLuts = selectedPackage
    ? selectedPackage.lutIds
        .map((id) => draft.luts.find((lut) => lut.id === id))
        .filter((lut): lut is RemoteLut => Boolean(lut))
    : [];
  const toneOptions = Array.from(new Set(draft.luts.map((lut) => lut.toneTag).filter(Boolean))).sort();
  const styleOptions = Array.from(new Set(draft.luts.map((lut) => lut.styleTag).filter(Boolean))).sort();
  const filteredPackageLuts = packageLuts.filter((lut) => {
    const query = lutSearch.trim().toLowerCase();
    if (query) {
      const text = [lut.name, lut.id, lut.fileName, lut.toneTag, lut.styleTag]
        .join(" ")
        .toLowerCase();
      if (!text.includes(query)) return false;
    }
    if (lutToneFilter !== "all" && lut.toneTag !== lutToneFilter) return false;
    if (lutStyleFilter !== "all" && lut.styleTag !== lutStyleFilter) return false;
    if (lutStatusFilter === "active" && !lut.isActive) return false;
    if (lutStatusFilter === "inactive" && lut.isActive) return false;
    return true;
  });
  const pageSize = 20;
  const pagedLuts = filteredPackageLuts.slice(page * pageSize, (page + 1) * pageSize);
  const pageCount = Math.max(1, Math.ceil(filteredPackageLuts.length / pageSize));

  const setCategory = (id: string, patch: Partial<RemoteCategory>) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === id ? { ...category, ...patch } : category,
      ),
    }));
  };

  const setPackage = (id: string, patch: Partial<LutPackage>) => {
    setDraft((current) => ({
      ...current,
      packages: current.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...patch } : pkg,
      ),
    }));
  };

  const setLut = (id: string, patch: Partial<RemoteLut>) => {
    setDraft((current) => ({
      ...current,
      luts: current.luts.map((lut) => (lut.id === id ? { ...lut, ...patch } : lut)),
    }));
  };

  const addCategory = () => {
    const name = "New Category";
    const id = createId("cat", `${name}-${Date.now()}`);
    setDraft((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          id,
          name,
          description: "",
          coverImage: "",
          order: current.categories.length + 1,
          isActive: true,
          packageIds: [],
        },
      ],
    }));
    setSelection({ type: "category", id });
  };

  const addPackage = (categoryId = draft.categories[0]?.id ?? "") => {
    if (!categoryId) return;
    const name = "New LUT Package";
    const id = createId("pkg", `${name}-${Date.now()}`);
    setDraft((current) => ({
      ...current,
      packages: [
        ...current.packages,
        {
          id,
          name,
          description: "",
          coverImage: "",
          styleTag: "",
          order: current.packages.length + 1,
          isActive: true,
          lutIds: [],
        },
      ],
      categories: current.categories.map((category) =>
        category.id === categoryId
          ? { ...category, packageIds: [...category.packageIds, id] }
          : category,
      ),
    }));
    setSelection({ type: "package", id });
  };

  const addLutToPackage = (packageId: string) => {
    const id = createId("lut", `new-lut-${Date.now()}`);
    setDraft((current) => ({
      ...current,
      luts: [
        ...current.luts,
        {
          id,
          name: "New LUT",
          fileName: "",
          previewImage: "",
          toneTag: "",
          styleTag: "",
          isActive: true,
          currentPackageId: packageId,
        },
      ],
      packages: current.packages.map((pkg) =>
        pkg.id === packageId ? { ...pkg, lutIds: [...pkg.lutIds, id] } : pkg,
      ),
    }));
  };

  const movePackageToCategory = (packageId: string, categoryId: string) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category) => ({
        ...category,
        packageIds:
          category.id === categoryId
            ? Array.from(new Set([...category.packageIds, packageId]))
            : category.packageIds.filter((id) => id !== packageId),
      })),
    }));
  };

  const moveLutToPackage = (lutId: string, targetPackageId: string) => {
    setDraft((current) => ({
      ...current,
      luts: current.luts.map((lut) =>
        lut.id === lutId ? { ...lut, currentPackageId: targetPackageId } : lut,
      ),
      packages: current.packages.map((pkg) => {
        const withoutLut = pkg.lutIds.filter((id) => id !== lutId);
        return pkg.id === targetPackageId
          ? { ...pkg, lutIds: Array.from(new Set([...withoutLut, lutId])) }
          : { ...pkg, lutIds: withoutLut };
      }),
    }));
  };

  const removeLutFromPackage = (lutId: string) => {
    setDraft((current) => ({
      ...current,
      luts: current.luts.map((lut) =>
        lut.id === lutId ? { ...lut, currentPackageId: null } : lut,
      ),
      packages: current.packages.map((pkg) => ({
        ...pkg,
        lutIds: pkg.lutIds.filter((id) => id !== lutId),
      })),
    }));
  };

  const deleteCategory = (category: RemoteCategory) => {
    if (
      category.packageIds.length &&
      !confirm("This category still has packages. Delete category and unassign those packages?")
    ) {
      return;
    }
    setDraft((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== category.id),
    }));
    setSelection({ type: "root", id: "root" });
  };

  const deletePackage = (pkg: LutPackage) => {
    if (
      pkg.lutIds.length &&
      !confirm("This package still has LUTs. Delete package and unassign those LUTs?")
    ) {
      return;
    }
    setDraft((current) => ({
      ...current,
      packages: current.packages.filter((item) => item.id !== pkg.id),
      categories: current.categories.map((category) => ({
        ...category,
        packageIds: category.packageIds.filter((id) => id !== pkg.id),
      })),
      luts: current.luts.map((lut) =>
        lut.currentPackageId === pkg.id ? { ...lut, currentPackageId: null } : lut,
      ),
    }));
    setSelection({ type: "root", id: "root" });
  };

  const reorder = (ids: string[], id: string, direction: -1 | 1) => {
    const index = ids.indexOf(id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return ids;
    const next = [...ids];
    const current = next[index];
    const target = next[nextIndex];
    if (!current || !target) return ids;
    next[index] = target;
    next[nextIndex] = current;
    return next;
  };

  const reorderCategory = (id: string, direction: -1 | 1) => {
    const sorted = [...draft.categories].sort((a, b) => a.order - b.order);
    const nextIds = reorder(sorted.map((item) => item.id), id, direction);
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category) => ({
        ...category,
        order: nextIds.indexOf(category.id) + 1,
      })),
    }));
  };

  const reorderPackageInCategory = (categoryId: string, packageId: string, direction: -1 | 1) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId
          ? { ...category, packageIds: reorder(category.packageIds, packageId, direction) }
          : category,
      ),
    }));
  };

  const reorderLut = (packageId: string, lutId: string, direction: -1 | 1) => {
    setDraft((current) => ({
      ...current,
      packages: current.packages.map((pkg) =>
        pkg.id === packageId
          ? { ...pkg, lutIds: reorder(pkg.lutIds, lutId, direction) }
          : pkg,
      ),
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={isLight ? "flex-1 bg-neutral-100" : "flex-1 bg-[#090909]"}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          className={
            isLight
              ? "[&_.react-flow__attribution]:bg-white/80 [&_.react-flow__attribution]:text-neutral-500 [&_.react-flow__controls-button]:border-neutral-200 [&_.react-flow__controls-button]:bg-white [&_.react-flow__controls-button]:text-neutral-700 [&_.react-flow__controls-button:hover]:bg-neutral-100"
              : "[&_.react-flow__attribution]:bg-black/70 [&_.react-flow__attribution]:text-white/40 [&_.react-flow__controls-button]:border-white/10 [&_.react-flow__controls-button]:bg-[#171717] [&_.react-flow__controls-button]:text-white/70 [&_.react-flow__controls-button:hover]:bg-[#222]"
          }
          fitView
          onNodeClick={(_, node) => {
            if (node.id === "root") setSelection({ type: "root", id: "root" });
            else if (node.id.startsWith("category:")) {
              setSelection({ type: "category", id: node.id.replace("category:", "") });
            } else if (node.id.startsWith("package:")) {
              setSelection({ type: "package", id: node.id.replace("package:", "") });
            }
          }}
        >
          <Background color={isLight ? "#d4d4d4" : "#333"} gap={22} />
          <Controls />
        </ReactFlow>
      </div>

      <div
        className={`w-[520px] shrink-0 overflow-y-auto border-l p-6 ${
          isLight ? "border-neutral-200 bg-white" : "border-white/5 bg-[#0d0d0d]"
        }`}
      >
        {selection.type === "root" && (
          <div className="space-y-5">
            <PanelHeader title="Remote Config" subtitle={`${draft.categories.length} categories · ${draft.packages.length} packages · ${draft.luts.length} LUTs`} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={addCategory} size="sm"><Plus size={14} /> Add category</Button>
              <Button onClick={() => addPackage()} size="sm" variant="outline"><Plus size={14} /> Add package</Button>
              <Button onClick={() => onSave(draft)} size="sm" disabled={errors.length > 0}><Save size={14} /> Save</Button>
              <Button onClick={() => onExport(draft)} size="sm" variant="outline"><Download size={14} /> Export JSON</Button>
              <Button onClick={onResetFromLuts} size="sm" variant="ghost"><RefreshCcw size={14} /> Regroup LUTs</Button>
            </div>
            <ValidationList errors={errors} isLight={isLight} />
            <Section title="Category Mobile" isLight={isLight}>
              {[...draft.categories].sort((a, b) => a.order - b.order).map((category) => (
                <ListRow key={category.id} isLight={isLight} onClick={() => setSelection({ type: "category", id: category.id })}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{category.name}</div>
                    <div className={isLight ? "text-xs text-neutral-500" : "text-xs text-white/40"}>{category.packageIds.length} packages · {category.isActive ? "Active" : "Inactive"}</div>
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={(event) => { event.stopPropagation(); reorderCategory(category.id, -1); }}>↑</Button>
                  <Button size="icon-sm" variant="ghost" onClick={(event) => { event.stopPropagation(); reorderCategory(category.id, 1); }}>↓</Button>
                </ListRow>
              ))}
            </Section>
            <Section title="LUT Packages" isLight={isLight}>
              {draft.packages.map((pkg) => (
                <ListRow key={pkg.id} isLight={isLight} onClick={() => setSelection({ type: "package", id: pkg.id })}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{pkg.name}</div>
                    <div className={isLight ? "text-xs text-neutral-500" : "text-xs text-white/40"}>{pkg.lutIds.length} LUTs · {pkg.isActive ? "Active" : "Inactive"}</div>
                  </div>
                  <Badge className={badgeClassName}>{pkg.styleTag || "style"}</Badge>
                </ListRow>
              ))}
            </Section>
            <Section title="JSON Preview" isLight={isLight}>
              <pre className={isLight ? "max-h-72 overflow-auto rounded-xl bg-neutral-100 p-4 text-xs text-neutral-600" : "max-h-72 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/55"}>{JSON.stringify(draft, null, 2)}</pre>
            </Section>
          </div>
        )}

        {selectedCategory && (
          <div className="space-y-5">
            <PanelHeader title={selectedCategory.name} subtitle={selectedCategory.id} />
            <Field label="Name" labelClassName={labelClassName}><Input value={selectedCategory.name} onChange={(event) => setCategory(selectedCategory.id, { name: event.target.value })} className={inputClassName} /></Field>
            <Field label="ID" labelClassName={labelClassName}><Input value={selectedCategory.id} readOnly className={inputClassName} /></Field>
            <Field label="Description" labelClassName={labelClassName}><Textarea value={selectedCategory.description} onChange={(event) => setCategory(selectedCategory.id, { description: event.target.value })} className={inputClassName} rows={3} /></Field>
            <Field label="Cover image" labelClassName={labelClassName}><Input value={selectedCategory.coverImage} onChange={(event) => setCategory(selectedCategory.id, { coverImage: event.target.value })} className={inputClassName} /></Field>
            {selectedCategory.coverImage ? <img src={selectedCategory.coverImage} alt="" className="h-28 w-full rounded-xl object-cover" /> : null}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Order" labelClassName={labelClassName}><Input type="number" value={selectedCategory.order} onChange={(event) => setCategory(selectedCategory.id, { order: Number(event.target.value) })} className={inputClassName} /></Field>
              <label className="flex items-end gap-2 pb-2 text-sm"><Switch checked={selectedCategory.isActive} onCheckedChange={(checked) => setCategory(selectedCategory.id, { isActive: checked })} /> Active</label>
            </div>
            <Section title="Assigned Packages" isLight={isLight}>
              {selectedCategory.packageIds.map((packageId) => {
                const pkg = draft.packages.find((item) => item.id === packageId);
                if (!pkg) return null;
                return (
                  <ListRow key={packageId} isLight={isLight} onClick={() => setSelection({ type: "package", id: packageId })}>
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{pkg.name}</div><div className={isLight ? "text-xs text-neutral-500" : "text-xs text-white/40"}>{pkg.lutIds.length} LUTs</div></div>
                    <Button size="icon-sm" variant="ghost" onClick={(event) => { event.stopPropagation(); reorderPackageInCategory(selectedCategory.id, packageId, -1); }}>↑</Button>
                    <Button size="icon-sm" variant="ghost" onClick={(event) => { event.stopPropagation(); reorderPackageInCategory(selectedCategory.id, packageId, 1); }}>↓</Button>
                    <Button size="icon-sm" variant="ghost" onClick={(event) => { event.stopPropagation(); setCategory(selectedCategory.id, { packageIds: selectedCategory.packageIds.filter((id) => id !== packageId) }); }}>×</Button>
                  </ListRow>
                );
              })}
              <Button onClick={() => addPackage(selectedCategory.id)} variant="outline" className="w-full"><Plus size={14} /> Add package to category</Button>
            </Section>
            <div className="flex gap-2">
              <Button onClick={() => onSave(draft)} disabled={errors.length > 0}><Save size={14} /> Save</Button>
              <Button variant="destructive" onClick={() => deleteCategory(selectedCategory)}><Trash2 size={14} /> Delete</Button>
            </div>
            <ValidationList errors={errors} isLight={isLight} />
          </div>
        )}

        {selectedPackage && (
          <div className="space-y-5">
            <PanelHeader title={selectedPackage.name} subtitle={selectedPackage.id} />
            <Field label="Name" labelClassName={labelClassName}><Input value={selectedPackage.name} onChange={(event) => setPackage(selectedPackage.id, { name: event.target.value })} className={inputClassName} /></Field>
            <Field label="ID" labelClassName={labelClassName}><Input value={selectedPackage.id} readOnly className={inputClassName} /></Field>
            <Field label="Description" labelClassName={labelClassName}><Textarea value={selectedPackage.description} onChange={(event) => setPackage(selectedPackage.id, { description: event.target.value })} className={inputClassName} rows={3} /></Field>
            <Field label="Cover image" labelClassName={labelClassName}><Input value={selectedPackage.coverImage} onChange={(event) => setPackage(selectedPackage.id, { coverImage: event.target.value })} className={inputClassName} /></Field>
            {selectedPackage.coverImage ? <img src={selectedPackage.coverImage} alt="" className="h-28 w-full rounded-xl object-cover" /> : null}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Style tag" labelClassName={labelClassName}><Input value={selectedPackage.styleTag} onChange={(event) => setPackage(selectedPackage.id, { styleTag: event.target.value })} className={inputClassName} /></Field>
              <Field label="Order" labelClassName={labelClassName}><Input type="number" value={selectedPackage.order} onChange={(event) => setPackage(selectedPackage.id, { order: Number(event.target.value) })} className={inputClassName} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Parent category" labelClassName={labelClassName}>
                <select value={packageCategoryId} onChange={(event) => movePackageToCategory(selectedPackage.id, event.target.value)} className={`${selectClassName} w-full`}>
                  {draft.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </Field>
              <label className="flex items-end gap-2 pb-2 text-sm"><Switch checked={selectedPackage.isActive} onCheckedChange={(checked) => setPackage(selectedPackage.id, { isActive: checked })} /> Active</label>
            </div>
            <Section title={`Included LUTs (${selectedPackage.lutIds.length})`} isLight={isLight}>
              <div className="grid grid-cols-2 gap-2">
                <Input value={lutSearch} onChange={(event) => { setLutSearch(event.target.value); setPage(0); }} className={inputClassName} placeholder="Search name/id/tag" />
                <select value={lutStatusFilter} onChange={(event) => setLutStatusFilter(event.target.value)} className={selectClassName}><option value="all">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
                <select value={lutToneFilter} onChange={(event) => setLutToneFilter(event.target.value)} className={selectClassName}><option value="all">All tones</option>{toneOptions.map((tone) => <option key={tone} value={tone}>{tone}</option>)}</select>
                <select value={lutStyleFilter} onChange={(event) => setLutStyleFilter(event.target.value)} className={selectClassName}><option value="all">All styles</option>{styleOptions.map((style) => <option key={style} value={style}>{style}</option>)}</select>
              </div>
              <Button onClick={() => addLutToPackage(selectedPackage.id)} variant="outline" className="w-full"><Plus size={14} /> Add LUT to package</Button>
              <div className="space-y-2">
                {pagedLuts.map((lut) => (
                  <Card key={lut.id} className={isLight ? "space-y-3 border-neutral-200 bg-neutral-50 p-3" : "space-y-3 border-white/10 bg-white/[0.03] p-3"}>
                    <div className="flex gap-3">
                      <div className={isLight ? "h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-200" : "h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/10"}>{lut.previewImage ? <img src={lut.previewImage} alt="" className="h-full w-full object-cover" /> : null}</div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <Input value={lut.name} onChange={(event) => setLut(lut.id, { name: event.target.value })} className={inputClassName} />
                        <div className="grid grid-cols-2 gap-2"><Input value={lut.fileName} onChange={(event) => setLut(lut.id, { fileName: event.target.value })} className={inputClassName} placeholder="file.cube" /><Input value={lut.previewImage} onChange={(event) => setLut(lut.id, { previewImage: event.target.value })} className={inputClassName} placeholder="preview URL" /></div>
                        <div className="grid grid-cols-2 gap-2"><Input value={lut.toneTag} onChange={(event) => setLut(lut.id, { toneTag: event.target.value })} className={inputClassName} placeholder="tone" /><Input value={lut.styleTag} onChange={(event) => setLut(lut.id, { styleTag: event.target.value })} className={inputClassName} placeholder="style" /></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={badgeClassName}>{lut.id}</Badge>
                      <label className="flex items-center gap-2 text-xs"><Switch size="sm" checked={lut.isActive} onCheckedChange={(checked) => setLut(lut.id, { isActive: checked })} /> Active</label>
                      <select value={lut.currentPackageId ?? ""} onChange={(event) => moveLutToPackage(lut.id, event.target.value)} className={selectClassName}>{draft.packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}</select>
                      <Button size="icon-sm" variant="ghost" onClick={() => reorderLut(selectedPackage.id, lut.id, -1)}>↑</Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => reorderLut(selectedPackage.id, lut.id, 1)}>↓</Button>
                      <Button size="sm" variant="ghost" onClick={() => removeLutFromPackage(lut.id)}>Remove</Button>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isLight ? "text-neutral-500" : "text-white/40"}>Page {page + 1} / {pageCount}</span>
                <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Prev</Button><Button size="sm" variant="outline" disabled={page >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>Next</Button></div>
              </div>
            </Section>
            <div className="flex gap-2"><Button onClick={() => onSave(draft)} disabled={errors.length > 0}><Save size={14} /> Save</Button><Button variant="destructive" onClick={() => deletePackage(selectedPackage)}><Trash2 size={14} /> Delete</Button></div>
            <ValidationList errors={errors} isLight={isLight} />
          </div>
        )}
      </div>
    </div>
  );
}

function buildFlow(config: RemoteConfig, selection: RemoteConfigSelection, isLight: boolean) {
  const nodes: Node<TreeNodeData>[] = [
    {
      id: "root",
      type: "treeNode",
      position: { x: 0, y: 0 },
      data: {
        title: "Remote Config",
        subtitle: `${config.categories.length} categories`,
        selected: selection.type === "root",
        tone: "root",
        isLight,
      },
    },
  ];
  const edges: Edge[] = [];
  const sortedCategories = [...config.categories].sort((a, b) => a.order - b.order);
  let y = 0;

  sortedCategories.forEach((category) => {
    const categoryY = y;
    nodes.push({
      id: `category:${category.id}`,
      type: "treeNode",
      position: { x: 320, y: categoryY },
      data: {
        title: category.name,
        subtitle: `${category.packageIds.length} packages`,
        status: category.isActive ? "Active" : "Inactive",
        selected: selection.type === "category" && selection.id === category.id,
        tone: "category",
        isLight,
      },
    });
    edges.push({ id: `root-${category.id}`, source: "root", target: `category:${category.id}`, animated: category.isActive });

    const packages = category.packageIds
      .map((id) => config.packages.find((pkg) => pkg.id === id))
      .filter((pkg): pkg is LutPackage => Boolean(pkg))
      .sort((a, b) => a.order - b.order);
    packages.forEach((pkg, index) => {
      nodes.push({
        id: `package:${pkg.id}`,
        type: "treeNode",
        position: { x: 660, y: categoryY + index * 120 },
        data: {
          title: pkg.name,
          subtitle: `${pkg.lutIds.length} LUTs`,
          status: pkg.isActive ? "Active" : "Inactive",
          selected: selection.type === "package" && selection.id === pkg.id,
          tone: "package",
          isLight,
        },
      });
      edges.push({ id: `${category.id}-${pkg.id}`, source: `category:${category.id}`, target: `package:${pkg.id}`, animated: pkg.isActive });
    });

    y += Math.max(1, packages.length) * 120 + 70;
  });

  return { nodes, edges };
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="font-heading text-3xl italic">{title}</h1>
      <p className="mt-1 text-sm opacity-50">{subtitle}</p>
    </div>
  );
}

function Field({ label, labelClassName, children }: { label: string; labelClassName: string; children: React.ReactNode }) {
  return <div><label className={labelClassName}>{label}</label>{children}</div>;
}

function Section({ title, isLight, children }: { title: string; isLight: boolean; children: React.ReactNode }) {
  return (
    <Card className={isLight ? "space-y-3 border-neutral-200 bg-white p-4 text-neutral-950 shadow-sm" : "space-y-3 border-white/10 bg-white/[0.03] p-4 text-white"}>
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </Card>
  );
}

function ListRow({ isLight, onClick, children }: { isLight: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={isLight ? "flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-left text-neutral-950 hover:bg-neutral-100" : "flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left text-white hover:bg-white/[0.06]"}>
      {children}
    </button>
  );
}

function ValidationList({ errors, isLight }: { errors: string[]; isLight: boolean }) {
  if (errors.length === 0) {
    return <div className={isLight ? "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700" : "rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400"}>Remote config is valid.</div>;
  }

  return (
    <div className={isLight ? "space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700" : "space-y-1 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300"}>
      {errors.map((error) => <div key={error}>{error}</div>)}
    </div>
  );
}
