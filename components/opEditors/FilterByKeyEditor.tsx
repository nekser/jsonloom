import MultiAutocompleteChips from "../MultiAutocompleteChips";
import { EditorProps } from "./common";
import { suggestIndexKeys } from "../../src/utils/pathSuggest";

export default function FilterByKeyEditor({ config, onChange, pathIndex }: EditorProps<{ mode?: string; keys?: string[] }>) {
  return (
    <div className="flex gap-2">
      <select className="border rounded px-2 py-1" value={config.mode ?? "keep"} onChange={(e) => onChange({ mode: e.target.value })}>
        <option value="keep">keep</option>
        <option value="remove">remove</option>
      </select>
      <MultiAutocompleteChips className="w-full" placeholder="keys" values={config.keys ?? []} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(vals) => onChange({ keys: vals })} />
    </div>
  );
}
