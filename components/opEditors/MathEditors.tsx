import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../utils/pathSuggest";

export function ScalarMathEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; value?: number }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="path (value or array)" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-32" placeholder="value" value={config.value ?? ""} onChange={(e) => onChange({ value: e.target.value === "" ? undefined : Number(e.target.value) })} />
    </div>
  );
}

export function RoundEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; precision?: number }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="path (value or array)" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-28" placeholder="precision" value={config.precision ?? 0} onChange={(e) => onChange({ precision: e.target.value === "" ? 0 : Number(e.target.value) })} />
    </div>
  );
}

export function ClampEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; min?: number; max?: number }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="path (value or array)" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-28" placeholder="min" value={config.min ?? ""} onChange={(e) => onChange({ min: e.target.value === "" ? undefined : Number(e.target.value) })} />
      <input className="border rounded px-2 py-1 w-28" placeholder="max" value={config.max ?? ""} onChange={(e) => onChange({ max: e.target.value === "" ? undefined : Number(e.target.value) })} />
    </div>
  );
}

export function AggregationEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="w-full" placeholder="array path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
    </div>
  );
}
