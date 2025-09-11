import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";

export function ValidateJSONEditor({ config, onChange, pathIndex }: EditorProps<{ path?: string; schema?: any; failOnError?: boolean }>) {
  const [text, setText] = useState<string>(() => toPretty(config.schema));
  const [error, setError] = useState<string | undefined>(undefined);

  const onSchemaChange = (val?: string) => {
    const t = val ?? "";
    setText(t);
    try {
      const parsed = t.trim() ? JSON.parse(t) : {};
      setError(undefined);
      onChange({ schema: parsed });
    } catch (e: any) {
      setError(e?.message || "Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput
        className="w-full"
        placeholder="path (optional)"
        value={config.path ?? ""}
        getSuggestions={(q) => (window as any).suggestPathTokens ? (window as any).suggestPathTokens(pathIndex, q) : []}
        onChange={(v) => onChange({ path: v })}
      />
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={config.failOnError ?? true} onChange={(e) => onChange({ failOnError: e.target.checked })} />
          Fail on error
        </label>
      </div>
      <div className="border rounded">
        <Editor
          height="220px"
          defaultLanguage="json"
          theme="vs-dark"
          value={text}
          onChange={onSchemaChange}
          options={{ minimap: { enabled: false }, wordWrap: "on" }}
        />
      </div>
      {error && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">{error}</div>}
    </div>
  );
}

function toPretty(obj: any): string {
  try { return JSON.stringify(obj ?? {}, null, 2); } catch { return "{}"; }
}
