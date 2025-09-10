"use client";
import { useMemo, useState } from "react";
import { useOpsStore, OperationType, State } from "../store/operations";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AutocompleteInput from "./AutocompleteInput";
import MultiAutocompleteChips from "./MultiAutocompleteChips";
import { buildPathIndex, suggestPathTokens, suggestTopLevelKeys, suggestAnyKeys, suggestIndexKeys } from "../utils/pathSuggest";

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
        {op.type === "FilterByKey" && (
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1"
              value={op.config.mode ?? "keep"}
              onChange={(e) => update(op.id, { config: { ...op.config, mode: e.target.value } })}
            >
              <option value="keep">keep</option>
              <option value="remove">remove</option>
            </select>
            <MultiAutocompleteChips
              className="w-full"
              placeholder="keys"
              values={op.config.keys ?? []}
              getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
              onChange={(vals) => update(op.id, { config: { ...op.config, keys: vals } })}
            />
          </div>
        )}
        {op.type === "RenameKey" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="w-1/2"
              placeholder="from"
              value={op.config.from ?? ""}
              getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, from: v } })}
            />
            <input
              className="border rounded px-2 py-1 w-1/2"
              placeholder="to"
              value={op.config.to ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, to: e.target.value } })}
            />
          </div>
        )}
        {op.type === "MapArray" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="w-2/3"
              placeholder="path e.g. items"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <select
              className="border rounded px-2 py-1 w-1/3"
              value={op.config.map ?? "identity"}
              onChange={(e) => update(op.id, { config: { ...op.config, map: e.target.value } })}
            >
              <option value="identity">identity</option>
              <option value="stringify">stringify</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
            </select>
          </div>
        )}
        {op.type === "ExtractPath" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="w-full"
              placeholder="path e.g. user.name"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
          </div>
        )}
        {op.type === "StringReplace" && (
          <div className="flex gap-2">
            <input
              className="border rounded px-2 py-1 w-1/2"
              placeholder="search"
              value={op.config.search ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, search: e.target.value } })}
            />
            <input
              className="border rounded px-2 py-1 w-1/2"
              placeholder="replace"
              value={op.config.replace ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, replace: e.target.value } })}
            />
          </div>
        )}
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
        <div className="font-medium">Operations</div>
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

function OperationPicker({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const add = useOpsStore((s: State) => s.addOperation);
  const list: { type: OperationType; desc: string }[] = useMemo(
    () => [
      { type: "FilterByKey", desc: "Keep or remove object keys by name" },
      { type: "RenameKey", desc: "Rename a key recursively" },
      { type: "MapArray", desc: "Map an array at a JSON path" },
      { type: "ExtractPath", desc: "Extract a nested value by path" },
      { type: "StringReplace", desc: "Replace text within string values" },
    ],
    []
  );
  return (
    <div>
      <button className="text-sm px-3 py-1.5 rounded border" onClick={() => onOpenChange(true)}>
        Add Operation
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => onOpenChange(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-md shadow-lg w-[520px] max-w-[95vw] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Add Operation</div>
              <button className="text-sm" onClick={() => onOpenChange(false)}>Close</button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {list.map((item) => (
                <button
                  key={item.type}
                  className="w-full text-left border rounded p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  onClick={() => {
                    add(item.type);
                    onOpenChange(false);
                  }}
                >
                  <div className="font-medium">{item.type}</div>
                  <div className="text-xs text-neutral-500">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
