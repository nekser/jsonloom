import { executePipelineFromSource, type PipelineExecutionInput, type PipelineExecutionResult } from "@/src/operations/pipelineExecution";

export async function executePipelinePreferWorker(input: PipelineExecutionInput): Promise<{ result: PipelineExecutionResult; mode: "worker" | "main" }> {
  // Prototype worker mode: cooperative yield to avoid blocking continuous typing interactions.
  // This is a safe runtime fallback when dedicated workers are unavailable or not bundled.
  if (typeof window === "undefined") {
    return { result: executePipelineFromSource(input), mode: "main" };
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return { result: executePipelineFromSource(input), mode: "worker" };
}

export function terminatePipelineWorker() {
  // no-op in prototype mode
}
