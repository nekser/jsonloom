"use client";
import { useEffect, useMemo, useState } from "react";
import { useOpsStore, OperationType, State } from "../store/operations";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AutocompleteInput from "./AutocompleteInput";
import MultiAutocompleteChips from "./MultiAutocompleteChips";
import { buildPathIndex, suggestPathTokens, suggestTopLevelKeys, suggestAnyKeys, suggestIndexKeys } from "../utils/pathSuggest";
import { operationCatalog, type OperationMeta } from "../operations/operationRegistry";
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
          <MapArrayEditor
            op={op as any}
            pathIndex={pathIndex}
            onUpdate={(cfg) => update(op.id, { config: { ...op.config, ...cfg } })}
          />
        )}
        {op.type === "FilterArray" && (
          <div className="flex flex-wrap gap-2">
            <AutocompleteInput
              className="flex-1 min-w-[40%]"
              placeholder="array path e.g. items"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <AutocompleteInput
              className="w-40"
              placeholder="key (optional)"
              value={op.config.key ?? ""}
              getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, key: v } })}
            />
            <select
              className="border rounded px-2 py-1"
              value={op.config.operator ?? "eq"}
              onChange={(e) => update(op.id, { config: { ...op.config, operator: e.target.value } })}
            >
              <option value="eq">eq</option>
              <option value="neq">neq</option>
              <option value="gt">gt</option>
              <option value="lt">lt</option>
              <option value="in">in</option>
              <option value="contains">contains</option>
            </select>
            <input
              className="border rounded px-2 py-1 flex-1 min-w-[20%]"
              placeholder="value"
              value={op.config.value ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, value: e.target.value } })}
            />
            <select
              className="border rounded px-2 py-1"
              value={op.config.mode ?? "keep"}
              onChange={(e) => update(op.id, { config: { ...op.config, mode: e.target.value } })}
            >
              <option value="keep">keep</option>
              <option value="remove">remove</option>
            </select>
          </div>
        )}
        {op.type === "SortArray" && (
          <div className="flex flex-wrap gap-2">
            <AutocompleteInput
              className="flex-1 min-w-[40%]"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <AutocompleteInput
              className="w-40"
              placeholder="by (optional)"
              value={op.config.by ?? ""}
              getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, by: v } })}
            />
            <select
              className="border rounded px-2 py-1"
              value={op.config.order ?? "asc"}
              onChange={(e) => update(op.id, { config: { ...op.config, order: e.target.value } })}
            >
              <option value="asc">asc</option>
              <option value="desc">desc</option>
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={!!op.config.caseInsensitive}
                onChange={(e) => update(op.id, { config: { ...op.config, caseInsensitive: e.target.checked } })}
              />
              case-insensitive
            </label>
            <select
              className="border rounded px-2 py-1"
              value={op.config.nulls ?? "last"}
              onChange={(e) => update(op.id, { config: { ...op.config, nulls: e.target.value } })}
            >
              <option value="first">nulls first</option>
              <option value="last">nulls last</option>
            </select>
          </div>
        )}
        {op.type === "UniqueArray" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <AutocompleteInput
              className="w-56"
              placeholder="by (optional)"
              value={op.config.by ?? ""}
              getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, by: v } })}
            />
          </div>
        )}
        {op.type === "FlattenArray" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <input
              className="border rounded px-2 py-1 w-32"
              placeholder="depth (number or 'infinity')"
              value={op.config.depth ?? 1}
              onChange={(e) => {
                const raw = e.target.value;
                const depth = raw === "infinity" ? "infinity" : Number(raw);
                update(op.id, { config: { ...op.config, depth } });
              }}
            />
          </div>
        )}
        {op.type === "SliceArray" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <input
              className="border rounded px-2 py-1 w-24"
              placeholder="start"
              value={op.config.start ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, start: e.target.value === "" ? undefined : Number(e.target.value) } })}
            />
            <input
              className="border rounded px-2 py-1 w-24"
              placeholder="end"
              value={op.config.end ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, end: e.target.value === "" ? undefined : Number(e.target.value) } })}
            />
            <input
              className="border rounded px-2 py-1 w-24"
              placeholder="step"
              value={op.config.step ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, step: e.target.value === "" ? undefined : Number(e.target.value) } })}
            />
          </div>
        )}
        {op.type === "GroupBy" && (
          <div className="flex flex-wrap gap-2">
            <AutocompleteInput
              className="flex-1 min-w-[40%]"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <AutocompleteInput
              className="w-40"
              placeholder="group by"
              value={op.config.by ?? ""}
              getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, by: v } })}
            />
            <select
              className="border rounded px-2 py-1"
              value={op.config.collect ?? "array"}
              onChange={(e) => update(op.id, { config: { ...op.config, collect: e.target.value } })}
            >
              <option value="array">array</option>
              <option value="count">count</option>
              <option value="sum">sum</option>
            </select>
            {op.config.collect === "sum" && (
              <AutocompleteInput
                className="w-44"
                placeholder="sum path"
                value={op.config.sumPath ?? ""}
                getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
                onChange={(v) => update(op.id, { config: { ...op.config, sumPath: v } })}
              />
            )}
          </div>
        )}
        {op.type === "ReduceArray" && (
          <div className="flex flex-wrap gap-2">
            <AutocompleteInput
              className="flex-1 min-w-[40%]"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <AutocompleteInput
              className="w-40"
              placeholder="by (optional)"
              value={op.config.by ?? ""}
              getSuggestions={(q) => suggestIndexKeys(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, by: v } })}
            />
            <select
              className="border rounded px-2 py-1"
              value={op.config.op ?? "sum"}
              onChange={(e) => update(op.id, { config: { ...op.config, op: e.target.value } })}
            >
              <option value="sum">sum</option>
              <option value="avg">avg</option>
              <option value="min">min</option>
              <option value="max">max</option>
              <option value="concat">concat</option>
            </select>
          </div>
        )}
        {op.type === "CountArray" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="w-full"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
          </div>
        )}
        {op.type === "JoinArray" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="array path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <input
              className="border rounded px-2 py-1 w-40"
              placeholder="," 
              value={op.config.delimiter ?? ","}
              onChange={(e) => update(op.id, { config: { ...op.config, delimiter: e.target.value } })}
            />
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
        {op.type === "RenameKeysByPattern" && (
          <div className="flex flex-wrap gap-2">
            <input
              className="border rounded px-2 py-1 flex-1 min-w-[40%]"
              placeholder="pattern (regex)"
              value={op.config.pattern ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, pattern: e.target.value } })}
            />
            <input
              className="border rounded px-2 py-1 w-44"
              placeholder="flags (e.g. gi)"
              value={op.config.flags ?? "g"}
              onChange={(e) => update(op.id, { config: { ...op.config, flags: e.target.value } })}
            />
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="replace"
              value={op.config.replace ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, replace: e.target.value } })}
            />
          </div>
        )}
        {op.type === "NormalizeKeyCase" && (
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1 w-48"
              value={op.config.mode ?? "camel"}
              onChange={(e) => update(op.id, { config: { ...op.config, mode: e.target.value } })}
            >
              <option value="camel">camel</option>
              <option value="snake">snake</option>
              <option value="kebab">kebab</option>
              <option value="pascal">pascal</option>
            </select>
          </div>
        )}
        {op.type === "PickPaths" && (
          <div className="flex flex-col gap-2">
            <textarea
              className="border rounded px-2 py-1 w-full h-28"
              placeholder="paths (one per line)"
              value={(op.config.paths ?? []).join("\n")}
              onChange={(e) => update(op.id, { config: { ...op.config, paths: e.target.value.split(/\r?\n/).filter(Boolean) } })}
            />
          </div>
        )}
        {op.type === "OmitPaths" && (
          <div className="flex flex-col gap-2">
            <textarea
              className="border rounded px-2 py-1 w-full h-28"
              placeholder="paths (one per line)"
              value={(op.config.paths ?? []).join("\n")}
              onChange={(e) => update(op.id, { config: { ...op.config, paths: e.target.value.split(/\r?\n/).filter(Boolean) } })}
            />
          </div>
        )}
        {op.type === "SetPath" && (
          <div className="flex flex-col gap-2">
            <AutocompleteInput
              className="w-full"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder='value (JSON literal, e.g. 123, "text", true)'
              value={typeof op.config.value === "string" ? op.config.value : JSON.stringify(op.config.value)}
              onChange={(e) => {
                const raw = e.target.value;
                try {
                  update(op.id, { config: { ...op.config, value: JSON.parse(raw) } });
                } catch {
                  update(op.id, { config: { ...op.config, value: raw } });
                }
              }}
            />
          </div>
        )}
        {op.type === "DeletePath" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="w-full"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
          </div>
        )}
        {op.type === "MergeAtPath" && (
          <div className="flex flex-wrap gap-2">
            <AutocompleteInput
              className="flex-1 min-w-[40%]"
              placeholder="target path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <select
              className="border rounded px-2 py-1"
              value={op.config.source ?? "root"}
              onChange={(e) => update(op.id, { config: { ...op.config, source: e.target.value } })}
            >
              <option value="root">root</option>
              <option value="path">path</option>
            </select>
            {op.config.source === "path" && (
              <AutocompleteInput
                className="w-64"
                placeholder="source path"
                value={op.config.sourcePath ?? ""}
                getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
                onChange={(v) => update(op.id, { config: { ...op.config, sourcePath: v } })}
              />
            )}
            <select
              className="border rounded px-2 py-1"
              value={op.config.strategy ?? "shallow"}
              onChange={(e) => update(op.id, { config: { ...op.config, strategy: e.target.value } })}
            >
              <option value="shallow">shallow</option>
              <option value="deep">deep</option>
              <option value="overwrite">overwrite</option>
            </select>
          </div>
        )}
        {op.type === "FlattenObject" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <input
              className="border rounded px-2 py-1 w-28"
              placeholder="delimiter"
              value={op.config.delimiter ?? "."}
              onChange={(e) => update(op.id, { config: { ...op.config, delimiter: e.target.value } })}
            />
            <input
              className="border rounded px-2 py-1 w-28"
              placeholder="maxDepth"
              value={op.config.maxDepth ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, maxDepth: e.target.value === "" ? undefined : Number(e.target.value) } })}
            />
          </div>
        )}
        {op.type === "UnflattenObject" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <input
              className="border rounded px-2 py-1 w-28"
              placeholder="delimiter"
              value={op.config.delimiter ?? "."}
              onChange={(e) => update(op.id, { config: { ...op.config, delimiter: e.target.value } })}
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
        {op.type === "RegexReplace" && (
          <div className="flex flex-wrap gap-2">
            <AutocompleteInput
              className="flex-1 min-w-[40%]"
              placeholder="path (optional: apply globally if empty)"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <input
              className="border rounded px-2 py-1 flex-1 min-w-[40%]"
              placeholder="pattern (regex)"
              value={op.config.pattern ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, pattern: e.target.value } })}
            />
            <input
              className="border rounded px-2 py-1 w-40"
              placeholder="flags (e.g. gi)"
              value={op.config.flags ?? "g"}
              onChange={(e) => update(op.id, { config: { ...op.config, flags: e.target.value } })}
            />
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="replace"
              value={op.config.replace ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, replace: e.target.value } })}
            />
          </div>
        )}
        {op.type === "TrimStrings" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="w-full"
              placeholder="path (optional: trim all if empty)"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
          </div>
        )}
        {op.type === "CoerceType" && (
          <div className="flex flex-wrap gap-2">
            <AutocompleteInput
              className="flex-1 min-w-[40%]"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <select
              className="border rounded px-2 py-1"
              value={op.config.to ?? "string"}
              onChange={(e) => update(op.id, { config: { ...op.config, to: e.target.value } })}
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
              <option value="array">array</option>
            </select>
            <input
              className="border rounded px-2 py-1 flex-1 min-w-[40%]"
              placeholder="fallback (optional)"
              value={op.config.fallback ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, fallback: e.target.value } })}
            />
          </div>
        )}
        {op.type === "TemplateInterpolate" && (
          <div className="flex flex-col gap-2">
            <AutocompleteInput
              className="w-full"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <textarea
              className="border rounded px-2 py-1 w-full h-24"
              placeholder="template (e.g., Hello ${user.name})"
              value={op.config.template ?? ""}
              onChange={(e) => update(op.id, { config: { ...op.config, template: e.target.value } })}
            />
            <select
              className="border rounded px-2 py-1 w-48"
              value={op.config.onMissing ?? "literal"}
              onChange={(e) => update(op.id, { config: { ...op.config, onMissing: e.target.value } })}
            >
              <option value="literal">leave literal</option>
              <option value="ignore">ignore</option>
              <option value="error">throw error</option>
            </select>
          </div>
        )}
        {op.type === "Base64" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <select
              className="border rounded px-2 py-1 w-40"
              value={op.config.mode ?? "encode"}
              onChange={(e) => update(op.id, { config: { ...op.config, mode: e.target.value } })}
            >
              <option value="encode">encode</option>
              <option value="decode">decode</option>
            </select>
          </div>
        )}
        {op.type === "StringCase" && (
          <div className="flex gap-2">
            <AutocompleteInput
              className="flex-1"
              placeholder="path"
              value={op.config.path ?? ""}
              getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
              onChange={(v) => update(op.id, { config: { ...op.config, path: v } })}
            />
            <select
              className="border rounded px-2 py-1 w-40"
              value={op.config.mode ?? "lowercase"}
              onChange={(e) => update(op.id, { config: { ...op.config, mode: e.target.value } })}
            >
              <option value="lowercase">lowercase</option>
              <option value="uppercase">uppercase</option>
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={!!op.config.coerceNonString}
                onChange={(e) => update(op.id, { config: { ...op.config, coerceNonString: e.target.checked } })}
              />
              coerce non-string
            </label>
          </div>
        )}
        {!(
          op.type === "FilterByKey" ||
          op.type === "RenameKey" ||
          op.type === "MapArray" ||
          op.type === "ExtractPath" ||
          op.type === "StringReplace" ||
          op.type === "FilterArray" ||
          op.type === "SortArray" ||
          op.type === "UniqueArray" ||
          op.type === "FlattenArray" ||
          op.type === "SliceArray" ||
          op.type === "GroupBy" ||
          op.type === "ReduceArray" ||
          op.type === "CountArray" ||
          op.type === "JoinArray" ||
          op.type === "RegexReplace" ||
          op.type === "TrimStrings" ||
          op.type === "CoerceType" ||
          op.type === "TemplateInterpolate" ||
          op.type === "Base64" ||
          op.type === "StringCase" ||
          op.type === "RenameKeysByPattern" ||
          op.type === "NormalizeKeyCase" ||
          op.type === "PickPaths" ||
          op.type === "OmitPaths" ||
          op.type === "SetPath" ||
          op.type === "DeletePath" ||
          op.type === "MergeAtPath" ||
          op.type === "FlattenObject" ||
          op.type === "UnflattenObject"
        ) && (
          <div className="text-xs text-neutral-500">No editor available for type '{op.type}'.</div>
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

// Nested editor for MapArray
function MapArrayEditor({ op, pathIndex, onUpdate }: { op: Operation; pathIndex: any; onUpdate: (patch: any) => void }) {
  const [open, setOpen] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
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
                  <NestedOperationCard key={n.id} op={n} sampleIndex={sampleIndex} onUpdate={onUpdateNested} onDelete={onDeleteNested} />
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

function NestedOperationCard({ op, sampleIndex, onUpdate, onDelete }: { op: Operation; sampleIndex: any; onUpdate: (id: string, patch: Partial<Operation>) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: op.id });
  const style: any = { transform: CSS.Transform.toString(transform), transition };
  const [collapsed, setCollapsed] = useState(true);
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
          {/* FilterByKey */}
          {op.type === "FilterByKey" && (
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1"
                value={(op as any).config.mode ?? "keep"}
                onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, mode: (e.target as HTMLSelectElement).value } })}
              >
                <option value="keep">keep</option>
                <option value="remove">remove</option>
              </select>
              <MultiAutocompleteChips
                className="w-full"
                placeholder="keys"
                values={(op as any).config.keys ?? []}
                getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)}
                onChange={(vals) => onUpdate(op.id, { config: { ...(op as any).config, keys: vals } })}
              />
            </div>
          )}
          {/* RenameKey */}
          {op.type === "RenameKey" && (
            <div className="flex gap-2">
              <AutocompleteInput className="w-1/2" placeholder="from" value={(op as any).config.from ?? ""} getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, from: v } })} />
              <input className="border rounded px-2 py-1 w-1/2" placeholder="to" value={(op as any).config.to ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, to: (e.target as HTMLInputElement).value } })} />
            </div>
          )}
          {/* Array ops */}
          {op.type === "FilterArray" && (
            <div className="flex flex-wrap gap-2">
              <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <AutocompleteInput className="w-40" placeholder="key (optional)" value={(op as any).config.key ?? ""} getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, key: v } })} />
              <select className="border rounded px-2 py-1" value={(op as any).config.operator ?? "eq"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, operator: (e.target as HTMLSelectElement).value } })}>
                <option value="eq">eq</option>
                <option value="neq">neq</option>
                <option value="gt">gt</option>
                <option value="lt">lt</option>
                <option value="in">in</option>
                <option value="contains">contains</option>
              </select>
              <input className="border rounded px-2 py-1 flex-1 min-w-[20%]" placeholder="value" value={(op as any).config.value ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, value: (e.target as HTMLInputElement).value } })} />
              <select className="border rounded px-2 py-1" value={(op as any).config.mode ?? "keep"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, mode: (e.target as HTMLSelectElement).value } })}>
                <option value="keep">keep</option>
                <option value="remove">remove</option>
              </select>
            </div>
          )}
          {op.type === "SortArray" && (
            <div className="flex flex-wrap gap-2">
              <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <AutocompleteInput className="w-40" placeholder="by (optional)" value={(op as any).config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, by: v } })} />
              <select className="border rounded px-2 py-1" value={(op as any).config.order ?? "asc"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, order: (e.target as HTMLSelectElement).value } })}>
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={!!(op as any).config.caseInsensitive} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, caseInsensitive: (e.target as HTMLInputElement).checked } })} />
                case-insensitive
              </label>
              <select className="border rounded px-2 py-1" value={(op as any).config.nulls ?? "last"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, nulls: (e.target as HTMLSelectElement).value } })}>
                <option value="first">nulls first</option>
                <option value="last">nulls last</option>
              </select>
            </div>
          )}
          {op.type === "UniqueArray" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <AutocompleteInput className="w-56" placeholder="by (optional)" value={(op as any).config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, by: v } })} />
            </div>
          )}
          {op.type === "FlattenArray" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <input className="border rounded px-2 py-1 w-32" placeholder="depth" value={(op as any).config.depth ?? 1} onChange={(e) => {
                const raw = (e.target as HTMLInputElement).value; const depth: any = raw === "infinity" ? "infinity" : Number(raw); onUpdate(op.id, { config: { ...(op as any).config, depth } });
              }} />
            </div>
          )}
          {op.type === "SliceArray" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <input className="border rounded px-2 py-1 w-24" placeholder="start" value={(op as any).config.start ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, start: (e.target as HTMLInputElement).value === "" ? undefined : Number((e.target as HTMLInputElement).value) } })} />
              <input className="border rounded px-2 py-1 w-24" placeholder="end" value={(op as any).config.end ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, end: (e.target as HTMLInputElement).value === "" ? undefined : Number((e.target as HTMLInputElement).value) } })} />
              <input className="border rounded px-2 py-1 w-24" placeholder="step" value={(op as any).config.step ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, step: (e.target as HTMLInputElement).value === "" ? undefined : Number((e.target as HTMLInputElement).value) } })} />
            </div>
          )}
          {op.type === "GroupBy" && (
            <div className="flex flex-wrap gap-2">
              <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <AutocompleteInput className="w-40" placeholder="group by" value={(op as any).config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, by: v } })} />
              <select className="border rounded px-2 py-1" value={(op as any).config.collect ?? "array"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, collect: (e.target as HTMLSelectElement).value } })}>
                <option value="array">array</option>
                <option value="count">count</option>
                <option value="sum">sum</option>
              </select>
              {(op as any).config.collect === "sum" && (
                <AutocompleteInput className="w-44" placeholder="sum path" value={(op as any).config.sumPath ?? ""} getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, sumPath: v } })} />
              )}
            </div>
          )}
          {op.type === "ReduceArray" && (
            <div className="flex flex-wrap gap-2">
              <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <AutocompleteInput className="w-40" placeholder="by (optional)" value={(op as any).config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, by: v } })} />
              <select className="border rounded px-2 py-1" value={(op as any).config.op ?? "sum"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, op: (e.target as HTMLSelectElement).value } })}>
                <option value="sum">sum</option>
                <option value="avg">avg</option>
                <option value="min">min</option>
                <option value="max">max</option>
                <option value="concat">concat</option>
              </select>
            </div>
          )}
          {op.type === "CountArray" && (
            <div className="flex gap-2">
              <AutocompleteInput className="w-full" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
            </div>
          )}
          {op.type === "JoinArray" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="array path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <input className="border rounded px-2 py-1 w-40" placeholder="," value={(op as any).config.delimiter ?? ","} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, delimiter: (e.target as HTMLInputElement).value } })} />
            </div>
          )}
          {/* Object ops */}
          {op.type === "RenameKeysByPattern" && (
            <div className="flex flex-wrap gap-2">
              <input className="border rounded px-2 py-1 flex-1 min-w-[40%]" placeholder="pattern (regex)" value={(op as any).config.pattern ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, pattern: (e.target as HTMLInputElement).value } })} />
              <input className="border rounded px-2 py-1 w-44" placeholder="flags (e.g. gi)" value={(op as any).config.flags ?? "g"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, flags: (e.target as HTMLInputElement).value } })} />
              <input className="border rounded px-2 py-1 w-full" placeholder="replace" value={(op as any).config.replace ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, replace: (e.target as HTMLInputElement).value } })} />
            </div>
          )}
          {op.type === "NormalizeKeyCase" && (
            <div className="flex gap-2">
              <select className="border rounded px-2 py-1 w-48" value={(op as any).config.mode ?? "camel"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, mode: (e.target as HTMLSelectElement).value } })}>
                <option value="camel">camel</option>
                <option value="snake">snake</option>
                <option value="kebab">kebab</option>
                <option value="pascal">pascal</option>
              </select>
            </div>
          )}
          {op.type === "PickPaths" && (
            <div className="flex flex-col gap-2">
              <textarea className="border rounded px-2 py-1 w-full h-28" placeholder="paths (one per line)" value={((op as any).config.paths ?? []).join("\n")} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, paths: (e.target as HTMLTextAreaElement).value.split(/\r?\n/).filter(Boolean) } })} />
            </div>
          )}
          {op.type === "OmitPaths" && (
            <div className="flex flex-col gap-2">
              <textarea className="border rounded px-2 py-1 w-full h-28" placeholder="paths (one per line)" value={((op as any).config.paths ?? []).join("\n")} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, paths: (e.target as HTMLTextAreaElement).value.split(/\r?\n/).filter(Boolean) } })} />
            </div>
          )}
          {op.type === "SetPath" && (
            <div className="flex flex-col gap-2">
              <AutocompleteInput className="w-full" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <input className="border rounded px-2 py-1 w-full" placeholder='value (JSON literal, e.g. 123, "text", true)' value={typeof (op as any).config.value === "string" ? (op as any).config.value : JSON.stringify((op as any).config.value)} onChange={(e) => {
                const raw = (e.target as HTMLInputElement).value; try { onUpdate(op.id, { config: { ...(op as any).config, value: JSON.parse(raw) } }); } catch { onUpdate(op.id, { config: { ...(op as any).config, value: raw } }); }
              }} />
            </div>
          )}
          {op.type === "DeletePath" && (
            <div className="flex gap-2">
              <AutocompleteInput className="w-full" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
            </div>
          )}
          {op.type === "MergeAtPath" && (
            <div className="flex flex-wrap gap-2">
              <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="target path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <select className="border rounded px-2 py-1" value={(op as any).config.source ?? "root"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, source: (e.target as HTMLSelectElement).value } })}>
                <option value="root">root</option>
                <option value="path">path</option>
              </select>
              {(op as any).config.source === "path" && (
                <AutocompleteInput className="w-64" placeholder="source path" value={(op as any).config.sourcePath ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, sourcePath: v } })} />
              )}
              <select className="border rounded px-2 py-1" value={(op as any).config.strategy ?? "shallow"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, strategy: (e.target as HTMLSelectElement).value } })}>
                <option value="shallow">shallow</option>
                <option value="deep">deep</option>
                <option value="overwrite">overwrite</option>
              </select>
            </div>
          )}
          {op.type === "FlattenObject" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <input className="border rounded px-2 py-1 w-28" placeholder="delimiter" value={(op as any).config.delimiter ?? "."} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, delimiter: (e.target as HTMLInputElement).value } })} />
              <input className="border rounded px-2 py-1 w-28" placeholder="maxDepth" value={(op as any).config.maxDepth ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, maxDepth: (e.target as HTMLInputElement).value === "" ? undefined : Number((e.target as HTMLInputElement).value) } })} />
            </div>
          )}
          {op.type === "UnflattenObject" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <input className="border rounded px-2 py-1 w-28" placeholder="delimiter" value={(op as any).config.delimiter ?? "."} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, delimiter: (e.target as HTMLInputElement).value } })} />
            </div>
          )}
          {/* String ops */}
          {op.type === "StringReplace" && (
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 w-1/2" placeholder="search" value={(op as any).config.search ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, search: (e.target as HTMLInputElement).value } })} />
              <input className="border rounded px-2 py-1 w-1/2" placeholder="replace" value={(op as any).config.replace ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, replace: (e.target as HTMLInputElement).value } })} />
            </div>
          )}
          {op.type === "RegexReplace" && (
            <div className="flex flex-wrap gap-2">
              <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="path (optional)" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <input className="border rounded px-2 py-1 flex-1 min-w-[40%]" placeholder="pattern (regex)" value={(op as any).config.pattern ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, pattern: (e.target as HTMLInputElement).value } })} />
              <input className="border rounded px-2 py-1 w-40" placeholder="flags (e.g. gi)" value={(op as any).config.flags ?? "g"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, flags: (e.target as HTMLInputElement).value } })} />
              <input className="border rounded px-2 py-1 w-full" placeholder="replace" value={(op as any).config.replace ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, replace: (e.target as HTMLInputElement).value } })} />
            </div>
          )}
          {op.type === "TrimStrings" && (
            <div className="flex gap-2">
              <AutocompleteInput className="w-full" placeholder="path (optional)" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
            </div>
          )}
          {op.type === "CoerceType" && (
            <div className="flex flex-wrap gap-2">
              <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <select className="border rounded px-2 py-1" value={(op as any).config.to ?? "string"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, to: (e.target as HTMLSelectElement).value } })}>
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="object">object</option>
                <option value="array">array</option>
              </select>
              <input className="border rounded px-2 py-1 flex-1 min-w-[40%]" placeholder="fallback (optional)" value={(op as any).config.fallback ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, fallback: (e.target as HTMLInputElement).value } })} />
            </div>
          )}
          {op.type === "TemplateInterpolate" && (
            <div className="flex flex-col gap-2">
              <AutocompleteInput className="w-full" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <textarea className="border rounded px-2 py-1 w-full h-24" placeholder="template" value={(op as any).config.template ?? ""} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, template: (e.target as HTMLTextAreaElement).value } })} />
              <select className="border rounded px-2 py-1 w-48" value={(op as any).config.onMissing ?? "literal"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, onMissing: (e.target as HTMLSelectElement).value } })}>
                <option value="literal">leave literal</option>
                <option value="ignore">ignore</option>
                <option value="error">throw error</option>
              </select>
            </div>
          )}
          {op.type === "Base64" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <select className="border rounded px-2 py-1 w-40" value={(op as any).config.mode ?? "encode"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, mode: (e.target as HTMLSelectElement).value } })}>
                <option value="encode">encode</option>
                <option value="decode">decode</option>
              </select>
            </div>
          )}
          {op.type === "StringCase" && (
            <div className="flex gap-2">
              <AutocompleteInput className="flex-1" placeholder="path" value={(op as any).config.path ?? ""} getSuggestions={(q) => suggestPathTokens(sampleIndex, q)} onChange={(v) => onUpdate(op.id, { config: { ...(op as any).config, path: v } })} />
              <select className="border rounded px-2 py-1 w-40" value={(op as any).config.mode ?? "lowercase"} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, mode: (e.target as HTMLSelectElement).value } })}>
                <option value="lowercase">lowercase</option>
                <option value="uppercase">uppercase</option>
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={!!(op as any).config.coerceNonString} onChange={(e) => onUpdate(op.id, { config: { ...(op as any).config, coerceNonString: (e.target as HTMLInputElement).checked } })} />
                coerce non-string
              </label>
            </div>
          )}
          {/* Fallback */}
          {! (
            op.type === "FilterByKey" ||
            op.type === "RenameKey" ||
            op.type === "MapArray" ||
            op.type === "ExtractPath" ||
            op.type === "StringReplace" ||
            op.type === "FilterArray" ||
            op.type === "SortArray" ||
            op.type === "UniqueArray" ||
            op.type === "FlattenArray" ||
            op.type === "SliceArray" ||
            op.type === "GroupBy" ||
            op.type === "ReduceArray" ||
            op.type === "CountArray" ||
            op.type === "JoinArray" ||
            op.type === "RegexReplace" ||
            op.type === "TrimStrings" ||
            op.type === "CoerceType" ||
            op.type === "TemplateInterpolate" ||
            op.type === "Base64" ||
            op.type === "StringCase" ||
            op.type === "RenameKeysByPattern" ||
            op.type === "NormalizeKeyCase" ||
            op.type === "PickPaths" ||
            op.type === "OmitPaths" ||
            op.type === "SetPath" ||
            op.type === "DeletePath" ||
            op.type === "MergeAtPath" ||
            op.type === "FlattenObject" ||
            op.type === "UnflattenObject"
          ) && (
            <div className="text-xs text-neutral-500">No editor available for type '{op.type}'.</div>
          )}
        </div>
      )}
    </div>
  );
}

function OperationPicker({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange: (v: boolean) => void; onSelect?: (type: OperationType) => void }) {
  const add = useOpsStore((s: State) => s.addOperation);
  const catalog = operationCatalog;

  // Search state with debounce
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 180);
    return () => clearTimeout(t);
  }, [search]);

  const normalize = (s: string) => s.toLowerCase();
  const match = (item: OperationMeta, q: string) =>
    normalize(item.label).includes(normalize(q)) || normalize(item.description).includes(normalize(q)) || normalize(item.type).includes(normalize(q));

  const filtered = useMemo(() => {
    if (!debounced.trim()) return catalog;
    return catalog.filter((it) => match(it, debounced));
  }, [catalog, debounced]);

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    const before = text.slice(0, i);
    const mid = text.slice(i, i + q.length);
    const after = text.slice(i + q.length);
    return (
      <>
        {before}
        <span className="font-semibold">{mid}</span>
        {after}
      </>
    );
  };

  const commitSelection = (item: OperationMeta) => {
    if (onSelect) onSelect(item.type);
    else add(item.type);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <div>
      <button className="text-sm px-3 py-1.5 rounded border" onClick={() => onOpenChange(true)}>
        Add Operation
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => onOpenChange(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-md shadow-lg w-[620px] max-w-[95vw] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Add Operation</div>
              <button className="text-sm" onClick={() => onOpenChange(false)}>Close</button>
            </div>
            <div className="space-y-3">
              <div>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Search operations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <CatalogList items={filtered} query={debounced} onSelect={commitSelection} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CatalogList({ items, query, onSelect }: { items: OperationMeta[]; query: string; onSelect: (m: OperationMeta) => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const it of items) initial[it.category] = true;
    return initial;
  });
  const grouped = useMemo(() => {
    const m = new Map<string, OperationMeta[]>();
    for (const it of items) {
      const key = it.category;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(it);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    const before = text.slice(0, i);
    const mid = text.slice(i, i + q.length);
    const after = text.slice(i + q.length);
    return (
      <>
        {before}
        <span className="font-semibold">{mid}</span>
        {after}
      </>
    );
  };

  if (items.length === 0) return <div className="text-center text-sm text-neutral-500 py-8">No operations match your search.</div>;

  return (
    <div className="space-y-2 max-h-[60vh] overflow-auto">
      {grouped.map(([cat, ops]) => {
        const isCollapsed = !!collapsed[cat];
        return (
          <div key={cat} className="border rounded">
            <button
              className="w-full flex items-center justify-between px-3 py-2 text-left bg-neutral-50 dark:bg-neutral-800"
              onClick={() => setCollapsed((s) => ({ ...s, [cat]: !s[cat] }))}
            >
              <span className="font-medium">{cat} Operations</span>
              <span className="text-xs text-neutral-500">{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>
            {!isCollapsed && (
              <div className="p-2 space-y-2">
                {ops.map((item) => (
                  <button
                    key={item.type}
                    className="w-full text-left border rounded p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    onClick={() => onSelect(item)}
                  >
                    <div className="font-medium">{highlight(item.label, query)}</div>
                    <div className="text-xs text-neutral-500">{highlight(item.description, query)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
