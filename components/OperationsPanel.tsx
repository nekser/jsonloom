"use client";
import { useEffect, useMemo, useState } from "react";
import { useOpsStore, OperationType, State } from "../store/operations";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AutocompleteInput from "./AutocompleteInput";
import { buildPathIndex, suggestPathTokens } from "../utils/pathSuggest";
import OperationPicker from "./OperationPicker";
import { editors } from "./opEditors/registry";
import { getOperationModule, type Operation } from "../operations";
import { nanoid } from "nanoid";
import { getByPath } from "../operations/utils";
import { PipelineSerializer } from "../utils/sharing/PipelineSerializer";
import { PipelineEncoder } from "../utils/sharing/PipelineEncoder";
import { PipelineValidator } from "../utils/sharing/PipelineValidator";

function OperationCard({ id, index }: { id: string; index: number }) {
  const op = useOpsStore((s: State) => s.operations[index]);
  const update = useOpsStore((s: State) => s.updateOperation);
  const remove = useOpsStore((s: State) => s.deleteOperation);
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const opIndexes = useOpsStore((s: State) => s.opIndexes);
  const interText = useOpsStore((s: State) => s.intermediate?.[op?.id ?? ""]);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const err = useOpsStore((s: State) => s.pipelineError);
  const hasErr = err && err.opId === op?.id ? err.message : undefined;
  const isEnabled = op?.enabled !== false;

  // Prefer precomputed index prior to this op; fallback to current source
  const sourceObj = useMemo(() => {
    try {
      return JSON.parse(sourceText);
    } catch {
      return null;
    }
  }, [sourceText]);
  const fallbackIndex = useMemo(() => buildPathIndex(sourceObj), [sourceObj]);
  const pathIndex = opIndexes[index] ?? fallbackIndex;

  if (!op) return null;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-md p-3 bg-white/50 dark:bg-neutral-900/50 ${!isEnabled ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${!isEnabled ? "line-through" : ""}`}>#{index + 1}</span>
          <span>{op.type}</span>
          {!isEnabled && <span className="text-xs text-neutral-500">(disabled)</span>}
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => update(op.id, { enabled: e.target.checked })}
            />
            Enable
          </label>
          <button
            className="text-xs px-2 py-1 rounded border"
            onClick={() => update(op.id, { debugOpen: !op.debugOpen })}
          >
            {op.debugOpen ? "Hide Result" : "View Result"}
          </button>
          <button className="text-xs px-2 py-1 rounded border" {...attributes} {...listeners}>
            Drag
          </button>
          <button className="text-xs px-2 py-1 rounded border" onClick={() => remove(op.id)}>
            Delete
          </button>
        </div>
      </div>
      <div className="mt-2">
        {op.type === "MapArray" ? (
          <MapArrayEditor op={op as any} pathIndex={pathIndex} onUpdate={(cfg) => update(op.id, { config: { ...op.config, ...cfg } })} />
        ) : op.type === "If" ? (
          <IfEditorCard op={op as any} pathIndex={pathIndex} onUpdate={(cfg) => update(op.id, { config: { ...op.config, ...cfg } })} />
        ) : op.type === "Switch" ? (
          <SwitchEditorCard op={op as any} pathIndex={pathIndex} onUpdate={(cfg) => update(op.id, { config: { ...op.config, ...cfg } })} />
        ) : (() => {
          const t = op.type as keyof typeof editors;
          const Editor = editors[t];
          if (!Editor)
            return <div className="text-xs text-neutral-500">No editor available for type '{op.type}'.</div>;
          return (
            <Editor
              config={op.config}
              onChange={(patch: any) => update(op.id, { config: { ...op.config, ...patch } })}
              pathIndex={pathIndex}
            />
          );
        })()}
        
      </div>
      {/* Intermediate result viewer */}
      {op.debugOpen && (
        <div className="mt-2 border rounded p-2 bg-neutral-50 dark:bg-neutral-900/40">
          {hasErr ? (
            <div className="text-xs text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2">
              {hasErr}
            </div>
          ) : (
            <div className="text-xs">
              <pre className="overflow-auto max-h-64 whitespace-pre-wrap">{interText ?? ""}</pre>
            </div>
          )}
        </div>
      )}
      {hasErr && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded p-2">
          {hasErr}
        </div>
      )}
    </div>
  );
}

export function OperationsPanel() {
  const ops = useOpsStore((s: State) => s.operations);
  const reorder = useOpsStore((s: State) => s.reorderOperations);
  const setOperations = useOpsStore((s: State) => s.setOperations);
  const setSourceText = useOpsStore((s: State) => s.setSourceText);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
  const oldIndex = ops.findIndex((o: { id: string }) => o.id === active.id);
  const newIndex = ops.findIndex((o: { id: string }) => o.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) reorder(oldIndex, newIndex);
  };

  // Parse pipeline from URL on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("pipeline");
    if (!encoded) return;
    const decoded = PipelineEncoder.decode(encoded);
    const ops = PipelineSerializer.deserialize(decoded);
    if (!ops) return;
    const v = PipelineValidator.validate(ops as any);
    if (!v.ok) return;
    setOperations(ops as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between p-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-medium flex items-center gap-2">
          Operations
          <span title="Paths support '*' wildcards. Example: users.*.age applies to each user's age." className="text-xs text-neutral-500 cursor-help">?</span>
        </div>
        <div className="flex gap-2">
          <button className="text-sm px-3 py-1.5 rounded border" onClick={() => {
            const ser = PipelineSerializer.serialize(ops as any);
            const enc = PipelineEncoder.encode(ser);
            const url = new URL(window.location.href);
            url.searchParams.set("pipeline", enc);
            setShareUrl(url.toString());
            setShareOpen(true);
          }}>Share</button>
          <button className="text-sm px-3 py-1.5 rounded border" onClick={() => setImportOpen(true)}>Import</button>
          <OperationPicker open={pickerOpen} onOpenChange={setPickerOpen} />
        </div>
      </div>
  <div className="flex-1 min-h-0 overflow-auto p-3 space-y-3">
        <DndContext onDragEnd={onDragEnd}>
          <SortableContext items={ops.map((o: { id: string }) => o.id)} strategy={verticalListSortingStrategy}>
            {ops.map((op: { id: string }, idx: number) => (
              <OperationCard key={op.id} id={op.id} index={idx} />
            ))}
          </SortableContext>
        </DndContext>
        {ops.length === 0 && (
          <div className="text-sm text-neutral-500">No operations yet. Add one to get started.</div>
        )}
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShareOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-md shadow-lg w-[720px] max-w-[95vw] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Share Pipeline</div>
              <button className="text-sm" onClick={() => setShareOpen(false)}>Close</button>
            </div>
            <div className="space-y-3">
              <input className="w-full border rounded px-3 py-2" value={shareUrl} readOnly />
              <div className="flex gap-2">
                <button
                  className="text-sm px-3 py-1.5 rounded border"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                  }}
                >Copy link</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setImportOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-md shadow-lg w-[720px] max-w-[95vw] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Import Pipeline</div>
              <button className="text-sm" onClick={() => setImportOpen(false)}>Close</button>
            </div>
            <div className="space-y-3">
              <textarea
                className="w-full border rounded px-3 py-2 h-36"
                placeholder="Paste the 'pipeline' query string value or full URL"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              {importError && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">{importError}</div>}
              <div className="flex gap-2">
                <button
                  className="text-sm px-3 py-1.5 rounded border"
                  onClick={() => {
                    try {
                      setImportError(undefined);
                      let encoded = importText.trim();
                      try {
                        const maybeUrl = new URL(encoded);
                        encoded = maybeUrl.searchParams.get("pipeline") || encoded;
                      } catch {}
                      const decoded = PipelineEncoder.decode(encoded);
                      const ops = PipelineSerializer.deserialize(decoded);
                      if (!ops) {
                        setImportError("Invalid pipeline payload");
                        return;
                      }
                      const v = PipelineValidator.validate(ops as any);
                      if (!v.ok) {
                        setImportError(v.error);
                        return;
                      }
                      setOperations(ops as any);
                      setImportOpen(false);
                    } catch (e: any) {
                      setImportError(e?.message || "Failed to import pipeline");
                    }
                  }}
                >Import</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Nested editor for MapArray
function MapArrayEditor({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: any; onUpdate: (patch: any) => void }) {
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
  const sampleIndex = useMemo(() => {
    if (!sourceObj) return pathIndex;
    try {
      const arr = getByPath(sourceObj, (op as any).config.path ?? "");
      if (Array.isArray(arr) && arr.length > 0) return buildPathIndex(arr[0]);
    } catch {}
    return pathIndex;
  }, [sourceObj, (op as any).config.path, pathIndex]);

  const nestedOps: Operation[] = (op as any).config.operations ?? [];

  const onAddNested = (type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: mod?.defaultConfig ?? {} };
    onUpdate({ operations: [...nestedOps, newOp] });
    setPickerOpen(false);
  setLastAddedId(newOp.id);
  };

  const onUpdateNested = (id: string, patch: Partial<Operation>) => {
    const next = nestedOps.map((n) => (n.id === id ? { ...n, ...patch, config: { ...n.config, ...patch.config } } : n));
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
          value={(op as any).config.path ?? ""}
          getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
          onChange={(v) => onUpdate({ path: v })}
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button className="text-xs px-2 py-1 rounded border" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"} operations
        </button>
        <label className="flex items-center gap-1 text-xs">
          <span>onError</span>
          <select
            className="border rounded px-2 py-1"
            value={(op as any).config.onError ?? "propagate"}
            onChange={(e) => onUpdate({ onError: (e.target as HTMLSelectElement).value })}
          >
            <option value="propagate">propagate</option>
            <option value="skip">skip element</option>
          </select>
        </label>
      </div>
      {open && (
        <div className="mt-1 border rounded-md p-2 bg-white/60 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm">Operations</div>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 rounded border" onClick={() => setPickerOpen(true)}>
                Add operation
              </button>
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
function IfEditorCard({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: any; onUpdate: (patch: any) => void }) {
  const [thenOpen, setThenOpen] = useState(true);
  const [elseOpen, setElseOpen] = useState(true);
  const nestedThen: Operation[] = (op as any).config.then ?? [];
  const nestedElse: Operation[] = (op as any).config.else ?? [];
  const [thenPickerOpen, setThenPickerOpen] = useState(false);
  const [elsePickerOpen, setElsePickerOpen] = useState(false);
  const [lastAddedThenId, setLastAddedThenId] = useState<string | null>(null);
  const [lastAddedElseId, setLastAddedElseId] = useState<string | null>(null);

  const addNested = (block: "then" | "else", type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: mod?.defaultConfig ?? {} };
    const key = block === "then" ? "then" : "else";
    const arr = (op as any).config[key] ?? [];
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
    const arr: Operation[] = (op as any).config[block] ?? [];
    const next = arr.map((n) => (n.id === id ? { ...n, ...patch, config: { ...n.config, ...patch.config } } : n));
    onUpdate({ [block]: next });
  };

  const deleteNested = (block: "then" | "else", id: string) => {
    const arr: Operation[] = (op as any).config[block] ?? [];
    onUpdate({ [block]: arr.filter((n) => n.id !== id) });
  };

  return (
    <div className="flex flex-col gap-3">
      {(() => {
        const t = (op as any).type as keyof typeof editors;
        const Editor = editors[t];
        return Editor ? (
          <Editor config={(op as any).config} onChange={(patch: any) => onUpdate(patch)} pathIndex={pathIndex} />
        ) : null;
      })()}
      <div className="border rounded-md p-2 bg-white/60 dark:bg-neutral-900/40">
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
      <div className="border rounded-md p-2 bg-white/60 dark:bg-neutral-900/40">
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
function SwitchEditorCard({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: any; onUpdate: (patch: any) => void }) {
  const config = (op as any).config || {};
  const cases: Array<{ value: string; ops: Operation[] }> = config.cases ?? [];
  const defOps: Operation[] | undefined = config.default ?? [];
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
    const newOp: Operation = { id: nanoid(), type, config: mod?.defaultConfig ?? {} };
    const next = cases.map((c, idx) => (idx === i ? { ...c, ops: [...c.ops, newOp] } : c));
    onUpdate({ cases: next });
    setPickerIndex(null);
  setLastAddedCaseOpId((prev) => ({ ...prev, [i]: newOp.id }));
  };
  const updateNested = (i: number, id: string, patch: Partial<Operation>) => {
    const next = cases.map((c, idx) => (idx === i ? { ...c, ops: c.ops.map((n) => (n.id === id ? { ...n, ...patch, config: { ...n.config, ...patch.config } } : n)) } : c));
    onUpdate({ cases: next });
  };
  const deleteNested = (i: number, id: string) => {
    const next = cases.map((c, idx) => (idx === i ? { ...c, ops: c.ops.filter((n) => n.id !== id) } : c));
    onUpdate({ cases: next });
  };

  const addDefaultOp = (type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: mod?.defaultConfig ?? {} };
    const next = [...(defOps ?? []), newOp];
    onUpdate({ default: next });
    setDefaultPickerOpen(false);
  setLastAddedDefaultOpId(newOp.id);
  };
  const updateDefaultNested = (id: string, patch: Partial<Operation>) => {
    const next = (defOps ?? []).map((n) => (n.id === id ? { ...n, ...patch, config: { ...n.config, ...patch.config } } : n));
    onUpdate({ default: next });
  };
  const deleteDefaultNested = (id: string) => {
    onUpdate({ default: (defOps ?? []).filter((n) => n.id !== id) });
  };

  return (
    <div className="flex flex-col gap-3">
      {(() => {
        const t = (op as any).type as keyof typeof editors;
        const Editor = editors[t];
        return Editor ? (
          <Editor config={config} onChange={(patch: any) => onUpdate(patch)} pathIndex={pathIndex} />
        ) : null;
      })()}
      <div className="flex items-center gap-2">
        <button className="text-xs px-2 py-1 rounded border" onClick={addCase}>Add case</button>
      </div>
      {cases.map((c, i) => (
        <div key={i} className="border rounded-md p-2 bg-white/60 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm">Case: <input className="border rounded px-2 py-1 w-40 ml-1" value={c.value} onChange={(e) => updateCaseValue(i, e.target.value)} /></div>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 rounded border" onClick={() => setPickerIndex(i)}>Add operation</button>
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
      <div className="border rounded-md p-2 bg-white/60 dark:bg-neutral-900/40">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">Default</div>
          <div className="flex gap-2">
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setDefaultPickerOpen(true)}>Add operation</button>
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

function NestedOperationCard({ op, sampleIndex, onUpdate, onDelete, initialCollapsed }: { op: Operation; sampleIndex: any; onUpdate: (id: string, patch: Partial<Operation>) => void; onDelete: (id: string) => void; initialCollapsed?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: op.id });
  const style: any = { transform: CSS.Transform.toString(transform), transition };
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? false);
  return (
    <div ref={setNodeRef} style={style} className="border rounded p-2 bg-white/60 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between">
        <button className="text-sm font-medium text-left" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? "▶" : "▽"} {op.type}
        </button>
        <div className="flex gap-2">
          <button className="text-xs px-2 py-1 rounded border" {...attributes} {...listeners}>
            Drag
          </button>
          <button className="text-xs px-2 py-1 rounded border" onClick={() => onDelete(op.id)}>
            Delete
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="mt-2">
          {/* MapArray recursive */}
          {op.type === "MapArray" && (
            <MapArrayEditor
              op={op as any}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => onUpdate(op.id, { config: { ...(op as any).config, ...cfg } })}
            />
          )}
          {/* If / Switch nested editors with full Then/Else & Cases/Default UI */}
          {op.type === "If" && (
            <IfEditorCard
              op={op as any}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => onUpdate(op.id, { config: { ...(op as any).config, ...cfg } })}
            />
          )}
          {op.type === "Switch" && (
            <SwitchEditorCard
              op={op as any}
              pathIndex={sampleIndex}
              onUpdate={(cfg) => onUpdate(op.id, { config: { ...(op as any).config, ...cfg } })}
            />
          )}
          {/* Generic editors via registry */}
          {(() => {
            const t = (op as any).type as keyof typeof editors;
            const Editor = editors[t];
            if (!Editor) return null;
            // Avoid double-rendering when specific nested editors above handled the type
            if (op.type === "MapArray" || op.type === "If" || op.type === "Switch") return null;
            return (
              <Editor
                config={(op as any).config}
                onChange={(patch: any) => onUpdate(op.id, { config: { ...(op as any).config, ...patch } })}
                pathIndex={sampleIndex}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}