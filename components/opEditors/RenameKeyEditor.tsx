import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestIndexKeys } from "../../utils/pathSuggest";

export default function RenameKeyEditor({ config, onChange, pathIndex }: EditorProps<{ from?: string; to?: string }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="w-1/2" placeholder="from" value={config.from ?? ""} getSuggestions={(q) => suggestIndexKeys(pathIndex, q)} onChange={(v) => onChange({ from: v })} />
      <input className="border rounded px-2 py-1 w-1/2" placeholder="to" value={config.to ?? ""} onChange={(e) => onChange({ to: e.target.value })} />
    </div>
  );
}
