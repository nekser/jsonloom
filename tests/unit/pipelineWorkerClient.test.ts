import { executePipelinePreferWorker, terminatePipelineWorker } from "@/src/operations/worker/client";

describe("pipeline worker client", () => {
  afterEach(() => {
    terminatePipelineWorker();
  });

  it("falls back to main mode when worker is unavailable", async () => {
    const exec = await executePipelinePreferWorker({
      sourceText: JSON.stringify({ n: 1 }),
      sourceFormat: "json",
      operations: [{ id: "add", type: "Add", config: { path: "n", value: 2 } }],
    });

    expect(exec.mode).toBe("main");
    expect(exec.result.ok).toBe(true);
    if (!exec.result.ok) return;
    expect(exec.result.run.output).toEqual({ n: 3 });
  });
});
