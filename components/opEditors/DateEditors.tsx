import React from "react";
import AutocompleteInput from "../../components/AutocompleteInput";
import { suggestPathTokens } from "../../src/utils/pathSuggest";
import type { EditorProps } from "./common";
import type { DateAddConfig } from "../../src/operations/DateAdd";
import type { DateDiffConfig } from "../../src/operations/DateDiff";
import type { ParseDateConfig } from "../../src/operations/ParseDate";
import type { IsDateCompareConfig } from "../../src/operations/IsDateCompare";

export function ParseDateEditor({ config, onChange, pathIndex }: EditorProps<ParseDateConfig>) {
  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput
        className="w-full"
        placeholder="path e.g. meta.generatedAt"
        value={config.path ?? ""}
        getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
        onChange={(v) => onChange({ path: v })}
      />
      <input className="border rounded px-2 py-1 w-full" placeholder="Format e.g. yyyy-LL-dd HH:mm:ss" value={config.format ?? ""} onChange={(e) => onChange({ format: e.target.value })} />
      <input className="border rounded px-2 py-1 w-full" placeholder="Timezone (default UTC)" value={config.timezone ?? ""} onChange={(e) => onChange({ timezone: e.target.value })} />
    </div>
  );
}

export function IsDateCompareEditor({ config, onChange, pathIndex }: EditorProps<IsDateCompareConfig>) {
  const updateCompareTo = (v: string) => onChange({ compareTo: v });
  return (
    <div className="flex flex-col gap-2">
  <AutocompleteInput className="w-full" placeholder="path to date e.g. users.*.orders.*.shippedAt" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <div className="flex gap-2 items-center">
  <select className="border rounded px-2 py-1" value={config.op ?? "after"} onChange={(e) => onChange({ op: (e.target as HTMLSelectElement).value as IsDateCompareConfig["op"] })}>
          <option value="after">After</option>
          <option value="afterOrEqual">After or Equal</option>
          <option value="before">Before</option>
          <option value="beforeOrEqual">Before or Equal</option>
        </select>
        <input className="border rounded px-2 py-1 flex-1" placeholder="Compare to date (ISO) or path e.g. meta.generatedAt" value={typeof config.compareTo === "string" ? config.compareTo : (config.compareTo?.path ?? "")} onChange={(e) => updateCompareTo(e.target.value)} />
      </div>
      <AutocompleteInput className="w-full" placeholder="result path (optional)" value={config.resultPath ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ resultPath: v })} />
    </div>
  );
}

export function DateAddEditor({ config, onChange, pathIndex }: EditorProps<DateAddConfig>) {
  return (
    <div className="flex flex-col gap-2">
  <AutocompleteInput className="w-full" placeholder="path to date" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <div className="flex gap-2 items-center">
        <input type="number" className="border rounded px-2 py-1 w-28" placeholder="Amount" value={config.amount ?? 0} onChange={(e) => onChange({ amount: Number(e.target.value) })} />
  <select className="border rounded px-2 py-1" value={config.unit ?? "days"} onChange={(e) => onChange({ unit: (e.target as HTMLSelectElement).value as DateAddConfig["unit"] })}>
          <option value="minutes">minutes</option>
          <option value="hours">hours</option>
          <option value="days">days</option>
          <option value="months">months</option>
          <option value="years">years</option>
        </select>
      </div>
    </div>
  );
}

export function DateDiffEditor({ config, onChange, pathIndex }: EditorProps<DateDiffConfig>) {
  return (
    <div className="flex flex-col gap-2">
  <AutocompleteInput className="w-full" placeholder="start path e.g. users.*.orders.*.createdAt" value={config.startPath ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ startPath: v })} />
  <AutocompleteInput className="w-full" placeholder="end path e.g. users.*.orders.*.shippedAt" value={config.endPath ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ endPath: v })} />
  <select className="border rounded px-2 py-1 w-40" value={config.unit ?? "days"} onChange={(e) => onChange({ unit: (e.target as HTMLSelectElement).value as DateDiffConfig["unit"] })}>
        <option value="minutes">minutes</option>
        <option value="hours">hours</option>
        <option value="days">days</option>
        <option value="months">months</option>
        <option value="years">years</option>
      </select>
    </div>
  );
}
