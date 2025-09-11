import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../utils/pathSuggest";

export default function StringCaseEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; mode?: string; coerceNonString?: boolean }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <select className="border rounded px-2 py-1 w-40" value={config.mode ?? "lowercase"} onChange={(e) => onChange({ mode: e.target.value })}>
        <option value="lowercase">lowercase</option>
        <option value="uppercase">uppercase</option>
      </select>
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={!!config.coerceNonString} onChange={(e) => onChange({ coerceNonString: e.target.checked })} />
        coerce non-string
      </label>
    </div>
  );
}
