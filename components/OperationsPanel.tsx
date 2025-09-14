"use client";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useOpsStore, OperationType, State } from "../src/store/operations";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AutocompleteInput from "./AutocompleteInput";
import { buildPathIndex, suggestPathTokens } from "../src/utils/pathSuggest";
import OperationPicker from "./OperationPicker";
import { editors } from "./opEditors/registry";
import { getOperationModule, type Operation } from "../src/operations/index";
import { nanoid } from "nanoid";
import { getByPath } from "../src/operations/utils";
import { PipelineSerializer } from "../src/utils/sharing/PipelineSerializer";
import { PipelineEncoder } from "../src/utils/sharing/PipelineEncoder";
import { PipelineValidator } from "../src/utils/sharing/PipelineValidator";
import OperationsToolbar from "./OperationsToolbar";
import { useIsMobile } from "./hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, GripVertical, Menu, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import type { CSSProperties } from "react";
import type { JSONValue, JSONObject } from "../src/types/json";
import type { PathIndex } from "../src/utils/pathSuggest";

function OperationCard({ id, index }: { id: string; index: number }) {
  const op = useOpsStore((s: State) => s.operations[index]);
  const update = useOpsStore((s: State) => s.updateOperation);
  const remove = useOpsStore((s: State) => s.deleteOperation);
  const reorder = useOpsStore((s: State) => s.reorderOperations);
  const opsAll = useOpsStore((s: State) => s.operations);
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const opIndexes = useOpsStore((s: State) => s.opIndexes);
  const interText = useOpsStore((s: State) => s.intermediate?.[op?.id ?? ""]);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const err = useOpsStore((s: State) => s.pipelineError);
  const hasErr = err && err.opId === op?.id ? err.message : undefined;
  const isEnabled = op?.enabled !== false;
  const isMobile = useIsMobile();
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [mobileResultOpen, setMobileResultOpen] = useState(false);

  const sourceObj = useMemo(() => {
    try {
      return JSON.parse(sourceText);
    } catch {
      return null;
    }
  }, [sourceText]);
  const fallbackIndex = useMemo(() => buildPathIndex(sourceObj), [sourceObj]);
  const pathIndex: PathIndex = (opIndexes[index] as PathIndex) ?? fallbackIndex;

  if (!op) return null;
  return (
  <div ref={setNodeRef} style={style} className={`border rounded-md p-3 op-surface ${!isEnabled ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${!isEnabled ? "line-through" : ""}`}>#{index + 1}</span>
          <span>{op.type}</span>
          {!isEnabled && <span className="text-xs text-neutral-500">(disabled)</span>}
        </div>
        {!isMobile ? (
          <div className="flex gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Switch id={`op-enable-${op.id}`} checked={isEnabled} onCheckedChange={(v) => update(op.id, { enabled: v })} />
            </div>
            <Button variant="outline" size="icon" onClick={() => update(op.id, { debugOpen: !op.debugOpen })}>
              {op.debugOpen ? <EyeOff /> : <Eye />}
            </Button>
            <Button variant="outline" size="icon" aria-label="Drag operation" {...attributes} {...listeners}>
              <GripVertical />
            </Button>
            <Button variant="outline" size="icon" aria-label="Delete operation" onClick={() => remove(op.id)}>
              <Trash2 />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="icon" onClick={() => setMobileActionsOpen(true)}>
            <Menu />
          </Button>
        )}
      </div>
      <div className="mt-2">
        {op.type === "MapArray" ? (
          <MapArrayEditor
            op={op}
            pathIndex={pathIndex}
            onUpdate={(cfg) => {
              const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
              const merged = { ...base, ...(cfg as Record<string, unknown>) } as unknown as JSONObject;
              update(op.id, { config: merged });
            }}
          />
        ) : op.type === "If" ? (
          <IfEditorCard
            op={op}
            pathIndex={pathIndex}
            onUpdate={(cfg) => {
              const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
              const merged = { ...base, ...(cfg as Record<string, unknown>) } as unknown as JSONObject;
              update(op.id, { config: merged });
            }}
          />
        ) : op.type === "Switch" ? (
          <SwitchEditorCard
            op={op}
            pathIndex={pathIndex}
            onUpdate={(cfg) => {
              const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
              const merged = { ...base, ...(cfg as Record<string, unknown>) } as unknown as JSONObject;
              update(op.id, { config: merged });
            }}
          />
        ) : (() => {
          const t = op.type as keyof typeof editors;
          const Editor = editors[t];
          if (!Editor) return <div className="text-xs text-neutral-500">No editor available for type &#39;{op.type}&#39;.</div>;
          return (
            <Editor
              config={((op.config && typeof op.config === "object" && !Array.isArray(op.config)) ? (op.config as Record<string, unknown>) : {})}
              onChange={(patch: Record<string, unknown>) => {
                const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
                const merged = { ...base, ...(patch as Record<string, unknown>) } as unknown as JSONObject;
                update(op.id, { config: merged });
              }}
              pathIndex={pathIndex}
            />
          );
        })()}
      </div>
      {!isMobile && op.debugOpen && (
  <div className="mt-2 border rounded p-2 op-surface">
          {hasErr ? (
            <div className="text-xs text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2">{hasErr}</div>
          ) : (
            <div className="text-xs">
              <pre className="overflow-auto max-h-64 whitespace-pre-wrap">{interText ?? ""}</pre>
            </div>
          )}
        </div>
      )}
      <Sheet open={isMobile && mobileActionsOpen} onOpenChange={setMobileActionsOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Actions</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 px-2 pb-2">
            {/* Enable/Disable row */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Label htmlFor={`op-enable-mobile-${op.id}`}>{isEnabled ? "Disable" : "Enable"}</Label>
              </div>
              <Switch
                id={`op-enable-mobile-${op.id}`}
                checked={isEnabled}
                onCheckedChange={(v) => update(op.id, { enabled: v })}
              />
            </div>

            {/* View Result */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setMobileActionsOpen(false);
                setMobileResultOpen(true);
              }}
            >
              <Eye />
              View Result
            </Button>

            {/* Reorder: Move Up / Move Down */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={index <= 0}
                onClick={() => {
                  if (index > 0) reorder(index, index - 1);
                }}
              >
                <ArrowUp />
                Move Up
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={index >= (opsAll.length - 1)}
                onClick={() => {
                  if (index < opsAll.length - 1) reorder(index, index + 1);
                }}
              >
                <ArrowDown />
                Move Down
              </Button>
            </div>

            {/* Delete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    remove(op.id);
                    setMobileActionsOpen(false);
                  }}
                >
                  <Trash2 />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete operation</TooltipContent>
            </Tooltip>
          </div>
        </SheetContent>
      </Sheet>
  <Dialog open={isMobile && mobileResultOpen} onOpenChange={setMobileResultOpen}>
        <DialogContent className="max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Intermediate Result</DialogTitle>
          </DialogHeader>
          {hasErr ? (
            <div className="text-xs text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2">{hasErr}</div>
          ) : (
            <div className="text-xs">
              <pre className="overflow-auto max-h-[70vh] whitespace-pre-wrap">{interText ?? ""}</pre>
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={async () => { await navigator.clipboard.writeText(String(interText ?? "")); }}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OperationsPanel() {
  const isMobile = useIsMobile();
  const ops = useOpsStore((s: State) => s.operations);
  const reorder = useOpsStore((s: State) => s.reorderOperations);
  const setOperations = useOpsStore((s: State) => s.setOperations);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Toolbar now owns share/import UI

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ops.findIndex((o: { id: string }) => o.id === active.id);
    const newIndex = ops.findIndex((o: { id: string }) => o.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) reorder(oldIndex, newIndex);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("pipeline");
    if (!encoded) return;
  const decoded = PipelineEncoder.decode(encoded);
  const ops = PipelineSerializer.deserialize(decoded);
    if (!ops) return;
  const v = PipelineValidator.validate(ops);
    if (!v.ok) return;
  setOperations(ops);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
  const handler = () => setPickerOpen(true);
  window.addEventListener("open-catalog" as unknown as keyof WindowEventMap, handler as EventListener);
  return () => window.removeEventListener("open-catalog" as unknown as keyof WindowEventMap, handler as EventListener);
  }, []);

  return (
    <TooltipProvider>
    <div className="flex flex-col h-full min-h-0">
      <OperationsToolbar />
      <OperationPicker open={pickerOpen} onOpenChange={setPickerOpen} />
      <div className={clsx("flex-1 min-h-0 overflow-auto p-3", isMobile ? "space-y-2" : "space-y-3")}>
        <DndContext onDragEnd={onDragEnd}>
          <SortableContext items={ops.map((o: { id: string }) => o.id)} strategy={verticalListSortingStrategy}>
            {ops.map((op: { id: string }, idx: number) => (
              <OperationCard key={op.id} id={op.id} index={idx} />
            ))}
          </SortableContext>
        </DndContext>
  {ops.length === 0 && <div className="text-sm text-neutral-500">No operations yet. Use Add step above to get started.</div>}
      </div>

  {/* Share/Import dialogs owned by OperationsToolbar */}
  </div>
  </TooltipProvider>
  );
}

// Nested editor for MapArray
function MapArrayEditor({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: PathIndex; onUpdate: (patch: Record<string, unknown>) => void }) {
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
      // ignore JSON path errors when building sample index
      // console.debug("sampleIndex build error", e);
    }
    return pathIndex;
  }, [sourceObj, pathIndex, cfgPath]);

  const nestedOps: Operation[] = (op.config as Record<string, unknown>)?.operations as Operation[] ?? [];

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
      const base = (n.config && typeof n.config === "object" && !Array.isArray(n.config) ? (n.config as Record<string, unknown>) : {});
      const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config) ? (patch.config as Record<string, unknown>) : {});
      return { ...n, ...patch, config: ({ ...base, ...patchCfg } as unknown as JSONObject) };
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

// If editor with nested Then/Else pipelines
function IfEditorCard({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: PathIndex; onUpdate: (patch: Record<string, unknown>) => void }) {
  const [thenOpen, setThenOpen] = useState(true);
  const [elseOpen, setElseOpen] = useState(true);
  const nestedThen: Operation[] = (op.config as Record<string, unknown>)?.then as Operation[] ?? [];
  const nestedElse: Operation[] = (op.config as Record<string, unknown>)?.else as Operation[] ?? [];
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
      const baseCfg = (n.config && typeof n.config === "object" && !Array.isArray(n.config) ? (n.config as Record<string, unknown>) : {});
      const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config) ? (patch.config as Record<string, unknown>) : {});
      return { ...n, ...patch, config: ({ ...baseCfg, ...patchCfg } as unknown as JSONObject) };
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
            const arr = [...nestedThen]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); onUpdate({ then: arr });
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
            const arr = [...nestedElse]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); onUpdate({ else: arr });
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

// Switch editor with cases
function SwitchEditorCard({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: PathIndex; onUpdate: (patch: Record<string, unknown>) => void }) {
  const config = (op.config as Record<string, unknown>) || {};
  const cases: Array<{ value: string; ops: Operation[] }> = (config.cases as Array<{ value: string; ops: Operation[] }>) ?? [];
  const defOps: Operation[] | undefined = (config.default as Operation[]) ?? [];
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [defaultPickerOpen, setDefaultPickerOpen] = useState(false);
  const [lastAddedCaseOpId, setLastAddedCaseOpId] = useState<Record<number, string | null>>({});
  const [lastAddedDefaultOpId, setLastAddedDefaultOpId] = useState<string | null>(null);

  const addCase = () => {
    const next = [...cases, { value: "", ops: [] }];
    onUpdate({ cases: next });
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
        const baseCfg = (n.config && typeof n.config === "object" && !Array.isArray(n.config) ? (n.config as Record<string, unknown>) : {});
        const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config) ? (patch.config as Record<string, unknown>) : {});
        return { ...n, ...patch, config: ({ ...baseCfg, ...patchCfg } as unknown as JSONObject) };
      })
    } : c));
    onUpdate({ cases: next });
  };
  const deleteNested = (i: number, id: string) => {
    const next = cases.map((c, idx) => (idx === i ? { ...c, ops: c.ops.filter((n) => n.id !== id) } : c));
    onUpdate({ cases: next });
  };

  const addDefaultOp = (type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? ({} as unknown as JSONObject) };
    const next = [...(defOps ?? []), newOp];
    onUpdate({ default: next });
    setDefaultPickerOpen(false);
  setLastAddedDefaultOpId(newOp.id);
  };
  const updateDefaultNested = (id: string, patch: Partial<Operation>) => {
    const next = (defOps ?? []).map((n) => {
      if (n.id !== id) return n;
      const baseCfg = (n.config && typeof n.config === "object" && !Array.isArray(n.config) ? (n.config as Record<string, unknown>) : {});
      const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config) ? (patch.config as Record<string, unknown>) : {});
      return { ...n, ...patch, config: ({ ...baseCfg, ...patchCfg } as unknown as JSONObject) };
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
            const arr = [...c.ops]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m);
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
          <OperationPicker open={pickerIndex === i} onOpenChange={(o) => setPickerIndex(o ? i : null)} onSelect={(t) => addOpToCase(i, t)} />
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
          const arr = [...(defOps ?? [])]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m);
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
        if (dx < -60) { // swipe left
          setSwiped(true);
        } else {
          setSwiped(false);
        }
        setTouchStartX(null);
      }}
    >
      <div className="flex items-center justify-between">
        <button className="text-sm font-medium text-left" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? "▶" : "▽"} {op.type}
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" {...attributes} {...listeners}>
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
          {/* MapArray recursive */}
      {op.type === "MapArray" && (
            <MapArrayEditor
        op={op}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => {
                const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
                onUpdate(op.id, { config: ({ ...base, ...(cfg as Record<string, unknown>) } as unknown as JSONObject) });
              }}
            />
          )}
          {/* If / Switch nested editors with full Then/Else & Cases/Default UI */}
      {op.type === "If" && (
            <IfEditorCard
        op={op}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => {
                const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
                onUpdate(op.id, { config: ({ ...base, ...(cfg as Record<string, unknown>) } as unknown as JSONObject) });
              }}
            />
          )}
      {op.type === "Switch" && (
            <SwitchEditorCard
        op={op}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => {
                const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
                onUpdate(op.id, { config: ({ ...base, ...(cfg as Record<string, unknown>) } as unknown as JSONObject) });
              }}
            />
          )}
          {/* Generic editors via registry */}
          {(() => {
      const t = op.type as keyof typeof editors;
            const Editor = editors[t];
            if (!Editor) return null;
            // Avoid double-rendering when specific nested editors above handled the type
            if (op.type === "MapArray" || op.type === "If" || op.type === "Switch") return null;
            return (
              <Editor
                config={((op.config && typeof op.config === "object" && !Array.isArray(op.config)) ? (op.config as Record<string, unknown>) : {})}
                onChange={(patch: Record<string, unknown>) => {
                  const base = (op.config && typeof op.config === "object" && !Array.isArray(op.config) ? (op.config as Record<string, unknown>) : {});
                  onUpdate(op.id, { config: ({ ...base, ...(patch as Record<string, unknown>) } as unknown as JSONObject) });
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