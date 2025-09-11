import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../utils/pathSuggest";

export default function TemplateInterpolateEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; template?: string; onMissing?: string }>) {
  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput className="w-full" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <textarea className="border rounded px-2 py-1 w-full h-24" placeholder="template" value={config.template ?? ""} onChange={(e) => onChange({ template: e.target.value })} />
      <select className="border rounded px-2 py-1 w-48" value={config.onMissing ?? "literal"} onChange={(e) => onChange({ onMissing: e.target.value })}>
        <option value="literal">leave literal</option>
        <option value="ignore">ignore</option>
        <option value="error">throw error</option>
      </select>
    </div>
  );
}
