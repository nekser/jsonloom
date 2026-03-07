import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useMemo, useState, type CSSProperties } from "react";
import type { OperationType } from "@/src/store/operations";
import { getOperationModule, type Operation } from "@/src/operations";
import { getByPath } from "@/src/operations/utils";
import type { JSONObject, JSONValue } from "@/src/types/json";
import type { PathIndex } from "@/src/utils/pathSuggest";
import { buildPathIndex, suggestPathTokens } from "@/src/utils/pathSuggest";
import { useOpsStore, type State } from "@/src/store/operations";
import OperationPicker from "@/components/OperationPicker";
import AutocompleteInput from "@/components/AutocompleteInput";
import { editors } from "@/components/opEditors/registry";
import { mergeConfig } from "./config";

export function MapArrayEditor({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: PathIndex; onUpdate: (patch: Record<string, unknown>) => void }) {
  const [open, setOpen] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const sourceObj = useMemo(() => {
    try {
      return JSON.parse(sourceText);
    } catch {
      return null;
    }
  }, [sourceText]);

  const cfgPath = useMemo(() => {
    const cfg = (op.config as Record<string, unknown>) || {};
    return typeof cfg.path === "string" ? cfg.path : "";
  }, [op.config]);

  const sampleIndex: PathIndex = useMemo(() => {
    if (!sourceObj) return pathIndex;
    try {
      const arr = getByPath(sourceObj as JSONValue, cfgPath);
      if (Array.isArray(arr) && arr.length > 0) return buildPathIndex(arr[0]);
    } catch {
      // ignore
    }
    return pathIndex;
  }, [sourceObj, pathIndex, cfgPath]);

  const nestedOps: Operation[] = ((op.config as Record<string, unknown>)?.operations as Operation[]) ?? [];

  const onAddNested = (type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? ({} as unknown as JSONObject) };
    onUpdate({ operations: [...nestedOps, newOp] });
    setPickerOpen(false);
    setLastAddedId(newOp.id);
  };

  const onUpdateNested = (id: string, patch: Partial<Operation>) => {
    const next = nestedOps.map((n) => {
      if (n.id !== id) return n;
      const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config)) ? (patch.config as Record<string, unknown>) : {};
      return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
    });
    onUpdate({ operations: next });
  };

  const onDeleteNested = (id: string) => {
    onUpdate({ operations: nestedOps.filter((n) => n.id !== id) });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = nestedOps.map((n) => n.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const arr = [...nestedOps];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onUpdate({ operations: arr });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <AutocompleteInput
          className="w-full"
          placeholder="path e.g. items"
          value={typeof (op.config as Record<string, unknown>)?.path === "string" ? ((op.config as Record<string, unknown>).path as string) : ""}
          getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
          onChange={(v) => onUpdate({ path: v })}
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"} operations
        </Button>
        <div className="flex items-center gap-2 text-xs">
          <span>onError</span>
          <Select value={(op.config as Record<string, unknown>)?.onError as string ?? "propagate"} onValueChange={(v) => onUpdate({ onError: v })}>
            <SelectTrigger className="h-7 px-2 py-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="propagate">propagate</SelectItem>
              <SelectItem value="skip">skip element</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {open && (
        <div className="mt-1 border rounded-md p-2 op-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm">Operations</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add step
              </Button>
            </div>
          </div>
          <DndContext onDragEnd={onDragEnd}>
            <SortableContext items={nestedOps.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {nestedOps.map((n) => (
                  <NestedOperationCard
                    key={n.id}
                    op={n}
                    sampleIndex={sampleIndex}
                    onUpdate={onUpdateNested}
                    onDelete={onDeleteNested}
                    initialCollapsed={n.id !== lastAddedId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <OperationPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(t) => onAddNested(t)} />
        </div>
      )}
    </div>
  );
}

export function IfEditorCard({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: PathIndex; onUpdate: (patch: Record<string, unknown>) => void }) {
  const [thenOpen, setThenOpen] = useState(true);
  const [elseOpen, setElseOpen] = useState(true);
  const nestedThen: Operation[] = ((op.config as Record<string, unknown>)?.then as Operation[]) ?? [];
  const nestedElse: Operation[] = ((op.config as Record<string, unknown>)?.else as Operation[]) ?? [];
  const [thenPickerOpen, setThenPickerOpen] = useState(false);
  const [elsePickerOpen, setElsePickerOpen] = useState(false);
  const [lastAddedThenId, setLastAddedThenId] = useState<string | null>(null);
  const [lastAddedElseId, setLastAddedElseId] = useState<string | null>(null);

  const addNested = (block: "then" | "else", type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? ({} as unknown as JSONObject) };
    const key = block === "then" ? "then" : "else";
    const base = op.config as Record<string, unknown>;
    const arr = (base?.[key] as Operation[]) ?? [];
    onUpdate({ [key]: [...arr, newOp] });
    if (block === "then") {
      setThenOpen(true);
      setThenPickerOpen(false);
      setLastAddedThenId(newOp.id);
    } else {
      setElseOpen(true);
      setElsePickerOpen(false);
      setLastAddedElseId(newOp.id);
    }
  };

  const updateNested = (block: "then" | "else", id: string, patch: Partial<Operation>) => {
    const base = op.config as Record<string, unknown>;
    const arr: Operation[] = (base?.[block] as Operation[]) ?? [];
    const next = arr.map((n) => {
      if (n.id !== id) return n;
      const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config)) ? (patch.config as Record<string, unknown>) : {};
      return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
    });
    onUpdate({ [block]: next });
  };

  const deleteNested = (block: "then" | "else", id: string) => {
    const base = op.config as Record<string, unknown>;
    const arr: Operation[] = (base?.[block] as Operation[]) ?? [];
    onUpdate({ [block]: arr.filter((n) => n.id !== id) });
  };

  return (
    <div className="flex flex-col gap-3">
      {(() => {
        const t = op.type as keyof typeof editors;
        const Editor = editors[t];
        return Editor ? (
          <Editor config={((op.config && typeof op.config === "object" && !Array.isArray(op.config)) ? (op.config as Record<string, unknown>) : {})} onChange={(patch: Record<string, unknown>) => onUpdate(patch)} pathIndex={pathIndex} />
        ) : null;
      })()}
      <div className="border rounded-md p-2 op-surface">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">Then</div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setThenOpen((v) => !v)}>{thenOpen ? "Hide" : "Show"}</button>
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setThenPickerOpen(true)}>Add operation</button>
          </div>
        </div>
        {thenOpen && (
          <DndContext onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            const ids = nestedThen.map((n) => n.id);
            const from = ids.indexOf(String(active.id));
            const to = ids.indexOf(String(over.id));
            if (from === -1 || to === -1) return;
            const arr = [...nestedThen];
            const [m] = arr.splice(from, 1);
            arr.splice(to, 0, m);
            onUpdate({ then: arr });
          }}>
            <SortableContext items={nestedThen.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {nestedThen.map((n) => (
                  <NestedOperationCard
                    key={n.id}
                    op={n}
                    sampleIndex={pathIndex}
                    onUpdate={(id, patch) => updateNested("then", id, patch)}
                    onDelete={(id) => deleteNested("then", id)}
                    initialCollapsed={n.id !== lastAddedThenId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <OperationPicker open={thenPickerOpen} onOpenChange={setThenPickerOpen} onSelect={(t) => addNested("then", t)} />
      </div>

      <div className="border rounded-md p-2 op-surface">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">Else</div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setElseOpen((v) => !v)}>{elseOpen ? "Hide" : "Show"}</button>
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setElsePickerOpen(true)}>Add operation</button>
          </div>
        </div>
        {elseOpen && (
          <DndContext onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            const ids = nestedElse.map((n) => n.id);
            const from = ids.indexOf(String(active.id));
            const to = ids.indexOf(String(over.id));
            if (from === -1 || to === -1) return;
            const arr = [...nestedElse];
            const [m] = arr.splice(from, 1);
            arr.splice(to, 0, m);
            onUpdate({ else: arr });
          }}>
            <SortableContext items={nestedElse.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {nestedElse.map((n) => (
                  <NestedOperationCard
                    key={n.id}
                    op={n}
                    sampleIndex={pathIndex}
                    onUpdate={(id, patch) => updateNested("else", id, patch)}
                    onDelete={(id) => deleteNested("else", id)}
                    initialCollapsed={n.id !== lastAddedElseId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <OperationPicker open={elsePickerOpen} onOpenChange={setElsePickerOpen} onSelect={(t) => addNested("else", t)} />
      </div>
    </div>
  );
}

export function SwitchEditorCard({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: PathIndex; onUpdate: (patch: Record<string, unknown>) => void }) {
  const config = (op.config as Record<string, unknown>) || {};
  const cases: Array<{ value: string; ops: Operation[] }> = (config.cases as Array<{ value: string; ops: Operation[] }>) ?? [];
  const defOps: Operation[] | undefined = (config.default as Operation[]) ?? [];
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [defaultPickerOpen, setDefaultPickerOpen] = useState(false);
  const [lastAddedCaseOpId, setLastAddedCaseOpId] = useState<Record<number, string | null>>({});
  const [lastAddedDefaultOpId, setLastAddedDefaultOpId] = useState<string | null>(null);

  const addCase = () => {
    onUpdate({ cases: [...cases, { value: "", ops: [] }] });
  };

  const updateCaseValue = (i: number, value: string) => {
    const next = cases.map((c, idx) => (idx === i ? { ...c, value } : c));
    onUpdate({ cases: next });
  };

  const addOpToCase = (i: number, type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? ({} as unknown as JSONObject) };
    const next = cases.map((c, idx) => (idx === i ? { ...c, ops: [...c.ops, newOp] } : c));
    onUpdate({ cases: next });
    setPickerIndex(null);
    setLastAddedCaseOpId((prev) => ({ ...prev, [i]: newOp.id }));
  };

  const updateNested = (i: number, id: string, patch: Partial<Operation>) => {
    const next = cases.map((c, idx) => (idx === i ? {
      ...c,
      ops: c.ops.map((n) => {
        if (n.id !== id) return n;
        const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config)) ? (patch.config as Record<string, unknown>) : {};
        return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
      }),
    } : c));
    onUpdate({ cases: next });
  };

  const deleteNested = (i: number, id: string) => {
    onUpdate({ cases: cases.map((c, idx) => (idx === i ? { ...c, ops: c.ops.filter((n) => n.id !== id) } : c)) });
  };

  const addDefaultOp = (type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? ({} as unknown as JSONObject) };
    onUpdate({ default: [...(defOps ?? []), newOp] });
    setDefaultPickerOpen(false);
    setLastAddedDefaultOpId(newOp.id);
  };

  const updateDefaultNested = (id: string, patch: Partial<Operation>) => {
    const next = (defOps ?? []).map((n) => {
      if (n.id !== id) return n;
      const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config)) ? (patch.config as Record<string, unknown>) : {};
      return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
    });
    onUpdate({ default: next });
  };

  const deleteDefaultNested = (id: string) => {
    onUpdate({ default: (defOps ?? []).filter((n) => n.id !== id) });
  };

  return (
    <div className="flex flex-col gap-3">
      {(() => {
        const t = op.type as keyof typeof editors;
        const Editor = editors[t];
        return Editor ? (
          <Editor config={config as Record<string, unknown>} onChange={(patch: Record<string, unknown>) => onUpdate(patch)} pathIndex={pathIndex} />
        ) : null;
      })()}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addCase}>Add case</Button>
      </div>
      {cases.map((c, i) => (
        <div key={i} className="border rounded-md p-2 op-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm">Case: <Input className="w-full sm:w-40 ml-1 h-7" value={c.value} onChange={(e) => updateCaseValue(i, e.target.value)} /></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPickerIndex(i)}>Add operation</Button>
            </div>
          </div>
          <DndContext onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            const ids = c.ops.map((n) => n.id);
            const from = ids.indexOf(String(active.id));
            const to = ids.indexOf(String(over.id));
            if (from === -1 || to === -1) return;
            const arr = [...c.ops];
            const [m] = arr.splice(from, 1);
            arr.splice(to, 0, m);
            const next = cases.map((cc, idx) => (idx === i ? { ...cc, ops: arr } : cc));
            onUpdate({ cases: next });
          }}>
            <SortableContext items={c.ops.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {c.ops.map((n) => (
                  <NestedOperationCard
                    key={n.id}
                    op={n}
                    sampleIndex={pathIndex}
                    onUpdate={(id, patch) => updateNested(i, id, patch)}
                    onDelete={(id) => deleteNested(i, id)}
                    initialCollapsed={n.id !== (lastAddedCaseOpId[i] ?? null)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <OperationPicker open={pickerIndex === i} onOpenChange={(open) => setPickerIndex(open ? i : null)} onSelect={(t) => addOpToCase(i, t)} />
        </div>
      ))}

      <div className="border rounded-md p-2 op-surface">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">Default</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDefaultPickerOpen(true)}>Add operation</Button>
          </div>
        </div>
        <DndContext onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const ids = (defOps ?? []).map((n) => n.id);
          const from = ids.indexOf(String(active.id));
          const to = ids.indexOf(String(over.id));
          if (from === -1 || to === -1) return;
          const arr = [...(defOps ?? [])];
          const [m] = arr.splice(from, 1);
          arr.splice(to, 0, m);
          onUpdate({ default: arr });
        }}>
          <SortableContext items={(defOps ?? []).map((n) => n.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {(defOps ?? []).map((n) => (
                <NestedOperationCard
                  key={n.id}
                  op={n}
                  sampleIndex={pathIndex}
                  onUpdate={(id, patch) => updateDefaultNested(id, patch)}
                  onDelete={(id) => deleteDefaultNested(id)}
                  initialCollapsed={n.id !== lastAddedDefaultOpId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <OperationPicker open={defaultPickerOpen} onOpenChange={setDefaultPickerOpen} onSelect={(t) => addDefaultOp(t)} />
      </div>
    </div>
  );
}

function NestedOperationCard({ op, sampleIndex, onUpdate, onDelete, initialCollapsed }: { op: Operation; sampleIndex: PathIndex; onUpdate: (id: string, patch: Partial<Operation>) => void; onDelete: (id: string) => void; initialCollapsed?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: op.id });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swiped, setSwiped] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded p-2 op-surface"
      onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        setSwiped(dx < -60);
        setTouchStartX(null);
      }}
    >
      <div className="flex items-center justify-between">
        <button className="text-sm font-medium text-left" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? ">" : "v"} {op.type}
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="cursor-move" {...attributes} {...listeners}>
            <GripVertical />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => onDelete(op.id)}>
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete operation</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {swiped && (
        <div className="mt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" onClick={() => onDelete(op.id)}>
                Confirm delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>Confirm deletion</TooltipContent>
          </Tooltip>
        </div>
      )}
      {!collapsed && (
        <div className="mt-2">
          {op.type === "MapArray" && (
            <MapArrayEditor
              op={op}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => {
                onUpdate(op.id, { config: mergeConfig(op.config, cfg) });
              }}
            />
          )}
          {op.type === "If" && (
            <IfEditorCard
              op={op}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => {
                onUpdate(op.id, { config: mergeConfig(op.config, cfg) });
              }}
            />
          )}
          {op.type === "Switch" && (
            <SwitchEditorCard
              op={op}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => {
                onUpdate(op.id, { config: mergeConfig(op.config, cfg) });
              }}
            />
          )}
          {(() => {
            const t = op.type as keyof typeof editors;
            const Editor = editors[t];
            if (!Editor) return null;
            if (op.type === "MapArray" || op.type === "If" || op.type === "Switch") return null;
            return (
              <Editor
                config={((op.config && typeof op.config === "object" && !Array.isArray(op.config)) ? (op.config as Record<string, unknown>) : {})}
                onChange={(patch: Record<string, unknown>) => {
                  onUpdate(op.id, { config: mergeConfig(op.config, patch) });
                }}
                pathIndex={sampleIndex}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}
