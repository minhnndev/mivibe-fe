import { useEffect, useMemo, useState } from "react";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeChange,
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

type NodePositions = Record<string, { x: number; y: number }>;

function TreeNode({ data }: NodeProps<Node<TreeNodeData>>) {
  const toneClass =
    data.tone === "root"
      ? data.isLight
        ? "border-purple-200 bg-white/95 shadow-purple-100/80"
        : "border-purple-400/50 bg-[#1c1430]/95 shadow-purple-950/25"
      : data.tone === "category"
        ? data.isLight
          ? "border-sky-200 bg-white/95 shadow-sky-100/80"
          : "border-sky-400/50 bg-[#0f1f2d]/95 shadow-sky-950/25"
        : data.isLight
          ? "border-emerald-200 bg-white/95 shadow-emerald-100/80"
          : "border-emerald-400/50 bg-[#10251d]/95 shadow-emerald-950/25";
  const iconClassName =
    data.tone === "root"
      ? data.isLight
        ? "bg-purple-100 text-purple-700"
        : "bg-purple-400/15 text-purple-200"
      : data.tone === "category"
        ? data.isLight
          ? "bg-sky-100 text-sky-700"
          : "bg-sky-400/15 text-sky-200"
        : data.isLight
          ? "bg-emerald-100 text-emerald-700"
          : "bg-emerald-400/15 text-emerald-200";
  const titleClassName = data.isLight ? "text-neutral-950" : "text-white";
  const subtitleClassName = data.isLight ? "text-neutral-600" : "text-white/65";
  const statusClassName = data.status === "Active"
    ? data.isLight
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
    : data.isLight
      ? "border-neutral-200 bg-neutral-100 text-neutral-500"
      : "border-white/10 bg-white/5 text-white/45";
  const selectedClassName = data.isLight ? "ring-2 ring-neutral-950/40" : "ring-2 ring-white/70";

  return (
    <div
      className={`w-[280px] rounded-[1.35rem] border px-5 py-4 shadow-2xl backdrop-blur-xl transition-transform hover:-translate-y-0.5 ${toneClass} ${
        data.selected ? selectedClassName : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 opacity-50" />
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${iconClassName}`}>
          {data.title.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-base font-semibold leading-tight ${titleClassName}`} title={data.title}>{data.title}</div>
          <div className={`mt-1 truncate text-sm ${subtitleClassName}`} title={data.subtitle}>{data.subtitle}</div>
        </div>
      </div>
      {data.status ? (
        <div className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusClassName}`}>
          {data.status}
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 opacity-50" />
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
  const [nodePositions, setNodePositions] = useState<NodePositions>({});
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

  const { nodes: arrangedNodes, edges } = useMemo(
    () => buildFlow(draft, selection, isLight, nodePositions),
    [draft, isLight, nodePositions, selection],
  );
  const [flowNodes, setFlowNodes] = useState<Node<TreeNodeData>[]>(arrangedNodes);

  useEffect(() => {
    setFlowNodes(arrangedNodes);
  }, [arrangedNodes]);

  const handleNodesChange = (changes: NodeChange<Node<TreeNodeData>>[]) => {
    setFlowNodes((current) => applyNodeChanges(changes, current));
  };

  const handleNodeDragStop = (_: MouseEvent | TouchEvent, node: Node<TreeNodeData>) => {
    setNodePositions((current) => {
      const currentPosition = current[node.id];
      if (
        currentPosition &&
        currentPosition.x === node.position.x &&
        currentPosition.y === node.position.y
      ) {
        return current;
      }

      return { ...current, [node.id]: node.position };
    });
  };

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
          storageKey: "",
          downloadUrl: "",
          previewImage: "",
          toneTag: "",
          styleTag: "",
          isActive: true,
          currentPackageId: packageId,
          intensity: 1,
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
      <div className={isLight ? "relative flex-1 bg-neutral-100" : "relative flex-1 bg-[#090909]"}>
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2">
          <div className={isLight ? "rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 text-xs text-neutral-500 shadow-sm backdrop-blur" : "rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs text-white/45 shadow-sm backdrop-blur"}>
            Drag nodes to arrange freely
          </div>
          {Object.keys(nodePositions).length > 0 ? (
            <Button
              className="pointer-events-auto h-8 rounded-full"
              size="sm"
              variant="outline"
              onClick={() => setNodePositions({})}
            >
              <RefreshCcw size={13} /> Auto arrange
            </Button>
          ) : null}
        </div>
        <ReactFlow
          nodes={flowNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onNodeDragStop={handleNodeDragStop}
          nodesDraggable
          elementsSelectable
          nodeDragThreshold={8}
          className={
            isLight
              ? "[&_.react-flow__attribution]:bg-white/80 [&_.react-flow__attribution]:text-neutral-500 [&_.react-flow__controls-button]:border-neutral-200 [&_.react-flow__controls-button]:bg-white [&_.react-flow__controls-button]:text-neutral-700 [&_.react-flow__controls-button:hover]:bg-neutral-100 [&_.react-flow__pane]:cursor-grab [&_.react-flow__pane:active]:cursor-grabbing"
              : "[&_.react-flow__attribution]:bg-black/70 [&_.react-flow__attribution]:text-white/40 [&_.react-flow__controls-button]:border-white/10 [&_.react-flow__controls-button]:bg-[#171717] [&_.react-flow__controls-button]:text-white/70 [&_.react-flow__controls-button:hover]:bg-[#222] [&_.react-flow__pane]:cursor-grab [&_.react-flow__pane:active]:cursor-grabbing"
          }
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.35}
          maxZoom={1.35}
          onNodeClick={(_, node) => {
            if (node.id === "root") setSelection({ type: "root", id: "root" });
            else if (node.id.startsWith("category:")) {
              setSelection({ type: "category", id: node.id.replace("category:", "") });
            } else if (node.id.startsWith("package:")) {
              setSelection({ type: "package", id: node.id.replace("package:", "") });
            }
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={isLight ? "#c7c7c7" : "#343434"}
            gap={24}
            size={2}
          />
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
                        <div className="grid grid-cols-2 gap-2"><Input value={lut.fileName} onChange={(event) => setLut(lut.id, { fileName: event.target.value })} className={inputClassName} placeholder="file.cube" /><Input value={lut.storageKey} onChange={(event) => setLut(lut.id, { storageKey: event.target.value })} className={inputClassName} placeholder="storage key" /></div>
                        <Input value={lut.downloadUrl} onChange={(event) => setLut(lut.id, { downloadUrl: event.target.value })} className={inputClassName} placeholder="download URL" />
                        <Input value={lut.previewImage} onChange={(event) => setLut(lut.id, { previewImage: event.target.value })} className={inputClassName} placeholder="preview URL" />
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

function buildFlow(
  config: RemoteConfig,
  selection: RemoteConfigSelection,
  isLight: boolean,
  nodePositions: NodePositions,
) {
  const nodes: Node<TreeNodeData>[] = [];
  const edges: Edge[] = [];
  const sortedCategories = [...config.categories].sort((a, b) => a.order - b.order);
  const selectedPackageId = selection.type === "package" ? selection.id : "";
  const selectedCategoryId =
    selection.type === "category"
      ? selection.id
      : sortedCategories.find((category) => category.packageIds.includes(selectedPackageId))?.id ?? "";
  const hasTreeSelection = Boolean(selectedCategoryId);
  const baseEdgeColor = isLight ? "#64748b" : "#94a3b8";
  const activeEdgeColor = isLight ? "#f97316" : "#fb923c";
  const columnCount = sortedCategories.length > 4 ? 2 : 1;
  const columnHeights = Array.from({ length: columnCount }, (_, index) => index * 90);
  const clusterGapX = 700;
  const clusterGapY = 210;
  const packageOffsetX = 300;
  const packageGapX = 300;
  const packageGapY = 165;

  const withCustomPosition = (id: string, position: { x: number; y: number }) =>
    nodePositions[id] ?? position;

  const getEdgeStyle = (highlighted: boolean, active: boolean) => ({
    stroke: highlighted ? activeEdgeColor : baseEdgeColor,
    strokeWidth: highlighted ? 4.75 : active ? 2.45 : 1.85,
    opacity: highlighted ? 1 : hasTreeSelection ? 0.42 : 0.78,
    filter: highlighted ? `drop-shadow(0 0 5px ${activeEdgeColor})` : undefined,
  });

  sortedCategories.forEach((category) => {
    const packages = category.packageIds
      .map((id) => config.packages.find((pkg) => pkg.id === id))
      .filter((pkg): pkg is LutPackage => Boolean(pkg))
      .sort((a, b) => a.order - b.order);
    const columnIndex = columnHeights.reduce(
      (bestIndex, height, index) => (height < (columnHeights[bestIndex] ?? 0) ? index : bestIndex),
      0,
    );
    const clusterTop = columnHeights[columnIndex] ?? 0;
    const categoryX = 360 + columnIndex * clusterGapX;
    const packageColumns = packages.length > 4 ? 2 : 1;
    const packageRows = Math.max(1, Math.ceil(packages.length / packageColumns));
    const clusterHeight = Math.max(220, packageRows * packageGapY);
    const categoryY = clusterTop + Math.max(0, (clusterHeight - 120) / 2);
    const categoryEdgeHighlighted = selectedCategoryId === category.id;
    const categoryNodeId = `category:${category.id}`;

    nodes.push({
      id: categoryNodeId,
      type: "treeNode",
      position: withCustomPosition(categoryNodeId, { x: categoryX, y: categoryY }),
      data: {
        title: category.name,
        subtitle: `${category.packageIds.length} packages`,
        status: category.isActive ? "Active" : "Inactive",
        selected: selection.type === "category" && selection.id === category.id,
        tone: "category",
        isLight,
      },
    });
    edges.push({
      id: `root-${category.id}`,
      source: "root",
      target: categoryNodeId,
      type: "simplebezier",
      animated: categoryEdgeHighlighted,
      style: getEdgeStyle(categoryEdgeHighlighted, category.isActive),
      zIndex: categoryEdgeHighlighted ? 10 : 0,
    });

    packages.forEach((pkg, index) => {
      const packageColumn = index % packageColumns;
      const packageRow = Math.floor(index / packageColumns);
      const packageX = categoryX + packageOffsetX + packageColumn * packageGapX;
      const packageY = clusterTop + packageRow * packageGapY + (packageColumn % 2) * 58;
      const packageEdgeHighlighted =
        selection.type === "category" ? selection.id === category.id : selectedPackageId === pkg.id;
      const packageNodeId = `package:${pkg.id}`;

      nodes.push({
        id: packageNodeId,
        type: "treeNode",
        position: withCustomPosition(packageNodeId, { x: packageX, y: packageY }),
        data: {
          title: pkg.name,
          subtitle: `${pkg.lutIds.length} LUTs`,
          status: pkg.isActive ? "Active" : "Inactive",
          selected: selection.type === "package" && selection.id === pkg.id,
          tone: "package",
          isLight,
        },
      });
      edges.push({
        id: `${category.id}-${pkg.id}`,
        source: categoryNodeId,
        target: packageNodeId,
        type: "simplebezier",
        animated: packageEdgeHighlighted,
        style: getEdgeStyle(packageEdgeHighlighted, pkg.isActive),
        zIndex: packageEdgeHighlighted ? 10 : 0,
      });
    });

    columnHeights[columnIndex] = clusterTop + clusterHeight + clusterGapY;
  });

  nodes.unshift({
    id: "root",
    type: "treeNode",
    position: withCustomPosition("root", { x: 0, y: Math.max(0, (Math.max(...columnHeights) - 430) / 2) }),
    data: {
      title: "Remote Config",
      subtitle: `${config.categories.length} categories · ${config.packages.length} packages`,
      selected: selection.type === "root",
      tone: "root",
      isLight,
    },
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
