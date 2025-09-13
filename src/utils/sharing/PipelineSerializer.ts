import type { Operation } from "../../operations/index";

export type SerializedPipelineV1 = {
  v: 1;
  ops: Operation[];
};

export const PipelineSerializer = {
  serialize(ops: Operation[]): SerializedPipelineV1 {
    return { v: 1, ops };
  },
  deserialize(obj: unknown): Operation[] | undefined {
    if (!obj || typeof obj !== "object") return undefined;
    const anyObj = obj as { v?: unknown; ops?: unknown };
    if (anyObj.v !== 1 || !Array.isArray(anyObj.ops)) return undefined;
    return anyObj.ops as Operation[];
  },
};
