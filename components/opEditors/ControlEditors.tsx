import { useState } from "react";
import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";

export function IfEditor({ config, onChange, pathIndex }: EditorProps<any>) {
  const [thenOpen, setThenOpen] = useState(true);
  const [elseOpen, setElseOpen] = useState(true);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="path" value={config.when?.path ?? ""} getSuggestions={(q) => (window as any).suggestPathTokens ? (window as any).suggestPathTokens(pathIndex, q) : []} onChange={(v) => onChange({ when: { ...(config.when ?? {}), path: v } })} />
        <select className="border rounded px-2 py-1" value={config.when?.op ?? "exists"} onChange={(e) => onChange({ when: { ...(config.when ?? {}), op: e.target.value } })}>
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
      <div className="flex items-center gap-2">
        <button className="text-xs px-2 py-1 rounded border" onClick={() => setThenOpen((v) => !v)}>{thenOpen ? "Hide" : "Show"} Then</button>
        <button className="text-xs px-2 py-1 rounded border" onClick={() => setElseOpen((v) => !v)}>{elseOpen ? "Hide" : "Show"} Else</button>
      </div>
      {thenOpen && <div className="text-xs text-neutral-500">Then: configure nested ops below in main panel.</div>}
      {elseOpen && <div className="text-xs text-neutral-500">Else: configure nested ops below in main panel.</div>}
    </div>
  );
}

export function SwitchEditor({ config, onChange, pathIndex }: EditorProps<any>) {
  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput className="w-full" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => (window as any).suggestPathTokens ? (window as any).suggestPathTokens(pathIndex, q) : []} onChange={(v) => onChange({ path: v })} />
      <div className="text-xs text-neutral-500">Cases are managed below in the card (nested ops per case).</div>
    </div>
  );
}
