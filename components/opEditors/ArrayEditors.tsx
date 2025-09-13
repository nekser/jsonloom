import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens, suggestIndexKeys } from "../../src/utils/pathSuggest";

type FilterArrayConfig = {
  path?: string;
  key?: string;
  operator?: "eq" | "neq" | "gt" | "lt" | "in" | "contains";
  value?: string;
  mode?: "keep" | "remove";
};

export function FilterArrayEditor({ config, onChange, pathIndex }: EditorProps<FilterArrayConfig>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path e.g. items" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <AutocompleteInput className="w-40" placeholder="key (optional)" value={config.key ?? ""} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(v) => onChange({ key: v })} />
  <select className="border rounded px-2 py-1" value={config.operator ?? "eq"} onChange={(e) => onChange({ operator: (e.target as HTMLSelectElement).value as NonNullable<FilterArrayConfig["operator"]> })}>
        <option value="eq">eq</option>
        <option value="neq">neq</option>
        <option value="gt">gt</option>
        <option value="lt">lt</option>
        <option value="in">in</option>
        <option value="contains">contains</option>
      </select>
      <input className="border rounded px-2 py-1 flex-1 min-w-[20%]" placeholder="value" value={config.value ?? ""} onChange={(e) => onChange({ value: e.target.value })} />
  <select className="border rounded px-2 py-1" value={config.mode ?? "keep"} onChange={(e) => onChange({ mode: (e.target as HTMLSelectElement).value as NonNullable<FilterArrayConfig["mode"]> })}>
        <option value="keep">keep</option>
        <option value="remove">remove</option>
      </select>
    </div>
  );
}

type SortArrayConfig = {
  path?: string;
  by?: string;
  order?: "asc" | "desc";
  caseInsensitive?: boolean;
  nulls?: "first" | "last";
};

export function SortArrayEditor({ config, onChange, pathIndex }: EditorProps<SortArrayConfig>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <AutocompleteInput className="w-40" placeholder="by (optional)" value={config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(v) => onChange({ by: v })} />
  <select className="border rounded px-2 py-1" value={config.order ?? "asc"} onChange={(e) => onChange({ order: (e.target as HTMLSelectElement).value as NonNullable<SortArrayConfig["order"]> })}>
        <option value="asc">asc</option>
        <option value="desc">desc</option>
      </select>
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={!!config.caseInsensitive} onChange={(e) => onChange({ caseInsensitive: e.target.checked })} />
        case-insensitive
      </label>
  <select className="border rounded px-2 py-1" value={config.nulls ?? "last"} onChange={(e) => onChange({ nulls: (e.target as HTMLSelectElement).value as NonNullable<SortArrayConfig["nulls"]> })}>
        <option value="first">nulls first</option>
        <option value="last">nulls last</option>
      </select>
    </div>
  );
}

type UniqueArrayConfig = { path?: string; by?: string };

export function UniqueArrayEditor({ config, onChange, pathIndex }: EditorProps<UniqueArrayConfig>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <AutocompleteInput className="w-56" placeholder="by (optional)" value={config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(v) => onChange({ by: v })} />
    </div>
  );
}

type FlattenArrayConfig = { path?: string; depth?: number | "infinity" };

export function FlattenArrayEditor({ config, onChange, pathIndex }: EditorProps<FlattenArrayConfig>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-32" placeholder="depth (number or 'infinity')" value={config.depth ?? 1} onChange={(e) => onChange({ depth: e.target.value === "infinity" ? "infinity" : Number(e.target.value) })} />
    </div>
  );
}

type SliceArrayConfig = { path?: string; start?: number; end?: number; step?: number };

export function SliceArrayEditor({ config, onChange, pathIndex }: EditorProps<SliceArrayConfig>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-24" placeholder="start" value={config.start ?? ""} onChange={(e) => onChange({ start: e.target.value === "" ? undefined : Number(e.target.value) })} />
      <input className="border rounded px-2 py-1 w-24" placeholder="end" value={config.end ?? ""} onChange={(e) => onChange({ end: e.target.value === "" ? undefined : Number(e.target.value) })} />
      <input className="border rounded px-2 py-1 w-24" placeholder="step" value={config.step ?? ""} onChange={(e) => onChange({ step: e.target.value === "" ? undefined : Number(e.target.value) })} />
    </div>
  );
}

type GroupByConfig = { path?: string; by?: string; collect?: "array" | "count" | "sum"; sumPath?: string };

export function GroupByEditor({ config, onChange, pathIndex }: EditorProps<GroupByConfig>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <AutocompleteInput className="w-40" placeholder="group by" value={config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(v) => onChange({ by: v })} />
  <select className="border rounded px-2 py-1" value={config.collect ?? "array"} onChange={(e) => onChange({ collect: (e.target as HTMLSelectElement).value as NonNullable<GroupByConfig["collect"]> })}>
        <option value="array">array</option>
        <option value="count">count</option>
        <option value="sum">sum</option>
      </select>
      {config.collect === "sum" && (
        <AutocompleteInput className="w-44" placeholder="sum path" value={config.sumPath ?? ""} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(v) => onChange({ sumPath: v })} />
      )}
    </div>
  );
}

type ReduceArrayConfig = { path?: string; by?: string; op?: "sum" | "avg" | "min" | "max" | "concat" };

export function ReduceArrayEditor({ config, onChange, pathIndex }: EditorProps<ReduceArrayConfig>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <AutocompleteInput className="w-40" placeholder="by (optional)" value={config.by ?? ""} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(v) => onChange({ by: v })} />
  <select className="border rounded px-2 py-1" value={config.op ?? "sum"} onChange={(e) => onChange({ op: (e.target as HTMLSelectElement).value as NonNullable<ReduceArrayConfig["op"]> })}>
        <option value="sum">sum</option>
        <option value="avg">avg</option>
        <option value="min">min</option>
        <option value="max">max</option>
        <option value="concat">concat</option>
      </select>
    </div>
  );
}

type CountArrayConfig = { path?: string };

export function CountArrayEditor({ config, onChange, pathIndex }: EditorProps<CountArrayConfig>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="w-full" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
    </div>
  );
}

type JoinArrayConfig = { path?: string; delimiter?: string };

export function JoinArrayEditor({ config, onChange, pathIndex }: EditorProps<JoinArrayConfig>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-40" placeholder="," value={config.delimiter ?? ","} onChange={(e) => onChange({ delimiter: e.target.value })} />
    </div>
  );
}
