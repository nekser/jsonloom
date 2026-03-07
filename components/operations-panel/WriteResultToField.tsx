import AutocompleteInput from "@/components/AutocompleteInput";
import type { JSONValue } from "@/src/types/json";
import type { PathIndex } from "@/src/utils/pathSuggest";
import { suggestPathTokens } from "@/src/utils/pathSuggest";
import { clearConfigKey, getStringConfig, mergeConfig } from "./config";

type Props = {
  config: unknown;
  pathIndex: PathIndex;
  onConfigChange: (nextConfig: JSONValue) => void;
};

export default function WriteResultToField({ config, pathIndex, onConfigChange }: Props) {
  const value = getStringConfig(config, "writeResultTo");

  return (
    <div className="mt-3 flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wide text-neutral-500">Write Result To (path)</label>
      <div className="relative w-full group">
        <AutocompleteInput
          className="w-full pr-6"
          placeholder="Leave empty to apply in-place"
          value={value}
          getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
          onChange={(next) => {
            const merged = mergeConfig(config, { writeResultTo: next.trim() === "" ? undefined : next });
            onConfigChange(merged as unknown as JSONValue);
          }}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear writeResultTo"
            className="absolute right-1 top-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs px-1"
            onClick={() => onConfigChange(clearConfigKey(config, "writeResultTo") as unknown as JSONValue)}
          >
            x
          </button>
        ) : null}
      </div>
      <div className="text-[10px] text-neutral-500">If set, the computed value is written to this path instead of its original location.</div>
    </div>
  );
}
