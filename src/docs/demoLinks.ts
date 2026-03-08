import { PipelineEncoder } from "@/src/utils/sharing/PipelineEncoder";
import type { JSONValue } from "@/src/types/json";
import type { Operation, OperationType } from "@/src/operations";

function op(type: OperationType, config: JSONValue): Operation {
  return {
    id: `demo-${type}`,
    type,
    config,
  };
}

export function buildDemoLink(type: OperationType, input: JSONValue, config: JSONValue): string {
  const pipeline = { v: 1 as const, ops: [op(type, config)] };
  const p = PipelineEncoder.encode(pipeline);
  const d = PipelineEncoder.encode(input);
  return `/?pipeline=${p}&data=${d}`;
}
