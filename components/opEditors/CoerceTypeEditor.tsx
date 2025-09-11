import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../utils/pathSuggest";

export default function CoerceTypeEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; to?: string; fallback?: string }>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <select className="border rounded px-2 py-1" value={config.to ?? "string"} onChange={(e) => onChange({ to: e.target.value })}>
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
        <option value="object">object</option>
        <option value="array">array</option>
      </select>
      <input className="border rounded px-2 py-1 flex-1 min-w-[40%]" placeholder="fallback (optional)" value={config.fallback ?? ""} onChange={(e) => onChange({ fallback: e.target.value })} />
    </div>
  );
}
