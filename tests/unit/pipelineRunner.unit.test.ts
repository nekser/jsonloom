import { runPipelineOperations } from "@/src/operations/pipelineRunner";
import type { Operation } from "@/src/operations";

describe("runPipelineOperations", () => {
  it("records intermediate outputs and skips disabled operations", () => {
    const ops: Operation[] = [
      { id: "a", type: "Add", config: { path: "n", value: 2 } as never },
      { id: "b", type: "Multiply", config: { path: "n", value: 10 } as never, enabled: false },
    ];

    const res = runPipelineOperations({ n: 1 }, ops);
    expect(res.error).toBeUndefined();
    expect(res.output).toEqual({ n: 3 });
    expect(res.inter.a).toEqual({ n: 3 });
    expect(res.inter.b).toEqual({ n: 3 });
    expect(res.indexes).toHaveLength(2);
  });
});
