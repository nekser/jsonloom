import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import type { AnySchema } from "ajv";
import { useCallback, useMemo, useState } from "react";
import { getByPath } from "../../src/operations/utils";
import type { JSONValue } from "../../src/types/json";
import AutocompleteInput from "../AutocompleteInput";
import { EditorProps } from "./common";

export function ValidateJSONEditor({ config, onChange, pathIndex, rootBefore }: EditorProps<{ path?: string; schema?: JSONValue; failOnError?: boolean; generateSchema?: boolean }>) {
  const [text, setText] = useState<string>(() => toPretty(config.schema));
  const [error, setError] = useState<string | undefined>(undefined);
  const targetSample = useMemo<JSONValue | JSONValue[] | undefined>(() => {
    if (!rootBefore) return undefined;
    try {
      const p = (config.path ?? "").trim();
      const t = p ? (getByPath(rootBefore as JSONValue, p) as JSONValue | JSONValue[]) : (rootBefore as JSONValue);
      return t as JSONValue | JSONValue[];
    } catch {
      return undefined;
    }
  }, [rootBefore, config.path]);

  const onSchemaChange = (val?: string) => {
    const t = val ?? "";
    setText(t);
    try {
      const parsed = t.trim() ? (JSON.parse(t) as JSONValue) : {};
      setError(undefined);
      onChange({ schema: parsed });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
    }
  };

  const handleGenerate = useCallback(async () => {
    try {
      const mod = await import("json-schema-generator");
      const gen = (mod as unknown as { default?: (x: unknown) => AnySchema }).default || (mod as unknown as (x: unknown) => AnySchema);
      const sample = targetSample;
      if (sample === undefined) {
        setError("No data available to infer schema at this step.")
        return;
      }
      const samples = Array.isArray(sample) ? sample : [sample];
      const schemas = samples.map((s) => gen(s as unknown));
      const combined: AnySchema = schemas.length === 1 ? (schemas[0] as AnySchema) : ({ anyOf: schemas } as unknown as AnySchema);
      const pretty = JSON.stringify(combined, null, 2);
      setText(pretty);
      setError(undefined);
      onChange({ schema: combined as unknown as JSONValue, generateSchema: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate schema";
      setError(msg);
    }
  }, [targetSample, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <AutocompleteInput
        className="w-full"
        placeholder="path (optional)"
        value={config.path ?? ""}
  getSuggestions={(q) => (globalThis as unknown as { suggestPathTokens?: (idx: unknown, q: string) => string[] }).suggestPathTokens ? (globalThis as unknown as { suggestPathTokens?: (idx: unknown, q: string) => string[] }).suggestPathTokens!(pathIndex, q) : []}
        onChange={(v) => onChange({ path: v })}
      />
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={config.failOnError ?? true} onChange={(e) => onChange({ failOnError: e.target.checked })} />
          Fail on error
        </label>
        <Button type="button" variant="outline" size="sm" onClick={handleGenerate} className="cursor-pointer">
          Generate Schema
        </Button>
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

function toPretty(obj: unknown): string {
  try { return JSON.stringify(obj ?? {}, null, 2); } catch { return "{}"; }
}
