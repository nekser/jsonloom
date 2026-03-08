import type { Operation } from "../../operations/index";

export type SerializedPipelineSchemaV1 = {
  schemaVersion: 1;
  ops: Operation[];
};

export const PipelineSerializer = {
  serialize(ops: Operation[]): SerializedPipelineSchemaV1 {
    return { schemaVersion: 1, ops };
  },
  deserialize(obj: unknown): Operation[] | undefined {
    if (!obj || typeof obj !== "object") return undefined;
    const anyObj = obj as { schemaVersion?: unknown; ops?: unknown };
    if (anyObj.schemaVersion !== 1 || !Array.isArray(anyObj.ops)) return undefined;
    return anyObj.ops as Operation[];
  },
};
