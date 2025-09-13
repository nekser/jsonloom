import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../src/utils/pathSuggest";

export default function RegexReplaceEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; pattern?: string; flags?: string; replace?: string }>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="path (optional)" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 flex-1 min-w-[40%]" placeholder="pattern (regex)" value={config.pattern ?? ""} onChange={(e) => onChange({ pattern: e.target.value })} />
      <input className="border rounded px-2 py-1 w-40" placeholder="flags (e.g. gi)" value={config.flags ?? "g"} onChange={(e) => onChange({ flags: e.target.value })} />
      <input className="border rounded px-2 py-1 w-full" placeholder="replace" value={config.replace ?? ""} onChange={(e) => onChange({ replace: e.target.value })} />
    </div>
  );
}
