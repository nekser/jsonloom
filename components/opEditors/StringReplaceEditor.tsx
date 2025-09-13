import { EditorProps } from "./common";
import AutocompleteInput from "../AutocompleteInput";
import { suggestPathTokens } from "../../src/utils/pathSuggest";

export default function StringReplaceEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; search?: string; replace?: string }>) {
  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput
        className="w-full"
        placeholder="path (optional, leave empty to apply globally)"
        value={config.path ?? ""}
        getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
        onChange={(v) => onChange({ path: v })}
      />
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1 w-1/2" placeholder="search" value={config.search ?? ""} onChange={(e) => onChange({ search: e.target.value })} />
        <input className="border rounded px-2 py-1 w-1/2" placeholder="replace" value={config.replace ?? ""} onChange={(e) => onChange({ replace: e.target.value })} />
      </div>
    </div>
  );
}
