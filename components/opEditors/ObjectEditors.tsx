import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";
import { suggestPathTokens } from "../../src/utils/pathSuggest";

export function RenameKeysByPatternEditor({ config, onChange }: EditorProps<{ pattern?: string; flags?: string; replace?: string }>) {
  return (
    <div className="flex flex-wrap gap-2">
      <input className="border rounded px-2 py-1 flex-1 min-w-[40%]" placeholder="pattern (regex)" value={config.pattern ?? ""} onChange={(e) => onChange({ pattern: e.target.value })} />
      <input className="border rounded px-2 py-1 w-44" placeholder="flags (e.g. gi)" value={config.flags ?? "g"} onChange={(e) => onChange({ flags: e.target.value })} />
      <input className="border rounded px-2 py-1 w-full" placeholder="replace" value={config.replace ?? ""} onChange={(e) => onChange({ replace: e.target.value })} />
    </div>
  );
}

export function NormalizeKeyCaseEditor({ config, onChange }: EditorProps<{ mode?: string }>) {
  return (
    <div className="flex gap-2">
      <select className="border rounded px-2 py-1 w-48" value={config.mode ?? "camel"} onChange={(e) => onChange({ mode: e.target.value })}>
        <option value="camel">camel</option>
        <option value="snake">snake</option>
        <option value="kebab">kebab</option>
        <option value="pascal">pascal</option>
      </select>
    </div>
  );
}

export function PickPathsEditor({ config, onChange }: EditorProps<{ paths?: string[] }>) {
  return (
    <div className="flex flex-col gap-2">
      <textarea className="border rounded px-2 py-1 w-full h-28" placeholder="paths (one per line)" value={(config.paths ?? []).join("\n")} onChange={(e) => onChange({ paths: e.target.value.split(/\r?\n/).filter(Boolean) })} />
    </div>
  );
}

export const OmitPathsEditor = PickPathsEditor;

export function SetPathEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; value?: any }>) {
  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput className="w-full" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input
        className="border rounded px-2 py-1 w-full"
        placeholder='value (JSON literal, e.g. 123, "text", true)'
        value={typeof config.value === "string" ? config.value : JSON.stringify(config.value)}
        onChange={(e) => {
          const raw = e.target.value;
          try {
            onChange({ value: JSON.parse(raw) });
          } catch {
            onChange({ value: raw });
          }
        }}
      />
    </div>
  );
}

export function DeletePathEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="w-full" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
    </div>
  );
}

export function MergeAtPathEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; source?: string; sourcePath?: string; strategy?: string }>) {
  return (
    <div className="flex flex-wrap gap-2">
      <AutocompleteInput className="flex-1 min-w-[40%]" placeholder="target path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <select className="border rounded px-2 py-1" value={config.source ?? "root"} onChange={(e) => onChange({ source: e.target.value })}>
        <option value="root">root</option>
        <option value="path">path</option>
      </select>
      {config.source === "path" && (
        <AutocompleteInput className="w-64" placeholder="source path" value={config.sourcePath ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ sourcePath: v })} />
      )}
      <select className="border rounded px-2 py-1" value={config.strategy ?? "shallow"} onChange={(e) => onChange({ strategy: e.target.value })}>
        <option value="shallow">shallow</option>
        <option value="deep">deep</option>
        <option value="overwrite">overwrite</option>
      </select>
    </div>
  );
}

export function FlattenObjectEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; delimiter?: string; maxDepth?: number }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-28" placeholder="delimiter" value={config.delimiter ?? "."} onChange={(e) => onChange({ delimiter: e.target.value })} />
      <input className="border rounded px-2 py-1 w-28" placeholder="maxDepth" value={config.maxDepth ?? ""} onChange={(e) => onChange({ maxDepth: e.target.value === "" ? undefined : Number(e.target.value) })} />
    </div>
  );
}

export function UnflattenObjectEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; delimiter?: string }>) {
  return (
    <div className="flex gap-2">
      <AutocompleteInput className="flex-1" placeholder="path" value={config.path ?? ""} getSuggestions={(q) => suggestPathTokens(pathIndex, q)} onChange={(v) => onChange({ path: v })} />
      <input className="border rounded px-2 py-1 w-28" placeholder="delimiter" value={config.delimiter ?? "."} onChange={(e) => onChange({ delimiter: e.target.value })} />
    </div>
  );
}
