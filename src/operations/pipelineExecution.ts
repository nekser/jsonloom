import { importCSV } from "@/src/importers/csv";
import { importJSON } from "@/src/importers/json";
import { importYAML } from "@/src/importers/yaml";
import { runPipelineOperations } from "@/src/operations/pipelineRunner";
import type { Operation } from "@/src/operations";
import type { JSONValue } from "@/src/types/json";

export type SourceFormat = "json" | "yaml" | "csv";

export type PipelineExecutionInput = {
  sourceText: string;
  sourceFormat: SourceFormat;
  operations: Operation[];
};

export type PipelineExecutionResult =
  | { ok: false; parseError: string }
  | {
      ok: true;
      run: ReturnType<typeof runPipelineOperations>;
    };

export function parseSource(sourceText: string, sourceFormat: SourceFormat): { value?: JSONValue; error?: string } {
  const parsed = sourceFormat === "json" ? importJSON(sourceText) : sourceFormat === "yaml" ? importYAML(sourceText) : importCSV(sourceText);
  if (parsed.error) return { error: parsed.error };
  return { value: parsed.value as JSONValue };
}

export function executePipelineFromSource(input: PipelineExecutionInput): PipelineExecutionResult {
  const parsed = parseSource(input.sourceText, input.sourceFormat);
  if (parsed.error) return { ok: false, parseError: parsed.error };
  const run = runPipelineOperations(parsed.value as JSONValue, input.operations);
  return { ok: true, run };
}
