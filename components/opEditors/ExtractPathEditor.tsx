import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../src/utils/pathSuggest";

export default function ExtractPathEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput
        className="w-full"
        placeholder="path e.g. user.name"
        value={config.path ?? ""}
        getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
        onChange={(v) => onChange({ path: v })}
      />
    </div>
  );
}
