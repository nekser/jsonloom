import type { Operation } from "@/src/operations";
import { PipelineSerializer } from "@/src/utils/sharing/PipelineSerializer";

describe("PipelineSerializer", () => {
  const ops: Operation[] = [{ id: "op-1", type: "ExtractPath", config: { path: "users" } }];

  it("serializes operations with schemaVersion", () => {
    expect(PipelineSerializer.serialize(ops)).toEqual({
      schemaVersion: 1,
      ops,
    });
  });

  it("deserializes valid schemaVersion payload", () => {
    const out = PipelineSerializer.deserialize({
      schemaVersion: 1,
      ops,
    });
    expect(out).toEqual(ops);
  });

  it("rejects legacy v payload", () => {
    const out = PipelineSerializer.deserialize({
      v: 1,
      ops,
    });
    expect(out).toBeUndefined();
  });
});
