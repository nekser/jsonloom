// no local state needed here
import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../src/utils/pathSuggest";

type IfConfig = { when?: { path?: string; op?: "exists" | "eq" | "neq" | "gt" | "lt" | "in" | "contains"; value?: string } };

export function IfEditor({ config, onChange, pathIndex }: EditorProps<IfConfig>) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
  <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="path" value={config.when?.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ when: { ...(config.when ?? {}), path: v } })} />
  <select className="border rounded px-2 py-1" value={config.when?.op ?? "exists"} onChange={(e) => onChange({ when: { ...(config.when ?? {}), op: (e.target as HTMLSelectElement).value as NonNullable<IfConfig["when"]>["op"] } })}>
          <option value="exists">exists</option>
          <option value="eq">eq</option>
          <option value="neq">neq</option>
          <option value="gt">gt</option>
          <option value="lt">lt</option>
          <option value="in">in</option>
          <option value="contains">contains</option>
        </select>
        <input className="border rounded px-2 py-1 flex-1 min-w-[30%]" placeholder="value (optional)" value={config.when?.value ?? ""} onChange={(e) => onChange({ when: { ...(config.when ?? {}), value: e.target.value } })} />
      </div>
    </div>
  );
}

type SwitchConfig = { path?: string };

export function SwitchEditor({ config, onChange, pathIndex }: EditorProps<SwitchConfig>) {
  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput className="w-full" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <div className="text-xs text-neutral-500">Cases are managed below in the card (nested ops per case).</div>
    </div>
  );
}
