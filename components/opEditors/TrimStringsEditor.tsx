import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../utils/pathSuggest";

export default function TrimStringsEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="w-full" placeholder="path (optional)" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
    </div>
  );
}
