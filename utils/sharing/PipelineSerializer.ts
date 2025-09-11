import type { Operation } from "../../operations";

export type SerializedPipelineV1 = {
  v: 1;
  ops: Operation[];
};

export const PipelineSerializer = {
  serialize(ops: Operation[]): SerializedPipelineV1 {
    return { v: 1, ops };
  },
  deserialize(obj: any): Operation[] | undefined {
    if (!obj || typeof obj !== "object") return undefined;
    if (obj.v !== 1 || !Array.isArray(obj.ops)) return undefined;
    return obj.ops as Operation[];
  },
};
