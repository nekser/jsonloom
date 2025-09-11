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

function OperationCard({ id, index }: { id: string; index: number }) {
  const op = useOpsStore((s: State) => s.operations[index]);
  const update = useOpsStore((s: State) => s.updateOperation);
  const remove = useOpsStore((s: State) => s.deleteOperation);
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const opIndexes = useOpsStore((s: State) => s.opIndexes);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const err = useOpsStore((s: State) => s.pipelineError);
  const hasErr = err && err.opId === op?.id ? err.message : undefined;

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
    <div ref={setNodeRef} style={style} className="border rounded-md p-3 bg-white/50 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between">
        <div className="font-medium">{op.type}</div>
        <div className="flex gap-2">
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
  const oldIndex = ops.findIndex((o: { id: string }) => o.id === active.id);
  const newIndex = ops.findIndex((o: { id: string }) => o.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) reorder(oldIndex, newIndex);
  };
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between p-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-medium flex items-center gap-2">
          Operations
          <span title="Paths support '*' wildcards. Example: users.*.age applies to each user's age." className="text-xs text-neutral-500 cursor-help">?</span>
        </div>
        <div className="flex gap-2">
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

function NestedOperationCard({ op, sampleIndex, onUpdate, onDelete, initialCollapsed }: { op: Operation; sampleIndex: any; onUpdate: (id: string, patch: Partial<Operation>) => void; onDelete: (id: string) => void; initialCollapsed?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: op.id });
  const style: any = { transform: CSS.Transform.toString(transform), transition };
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? true);
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
          {/* Generic editors via registry */}
          {(() => {
            const t = (op as any).type as keyof typeof editors;
            const Editor = editors[t];
            if (!Editor) return null;
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