import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../src/utils/pathSuggest";

export default function Base64Editor({ config, onChange, pathIndex }: EditorProps<{ path?: string; mode?: string }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <select className="border rounded px-2 py-1 w-40" value={config.mode ?? "encode"} onChange={(e) => onChange({ mode: e.target.value })}>
        <option value="encode">encode</option>
        <option value="decode">decode</option>
      </select>
    </div>
  );
}
