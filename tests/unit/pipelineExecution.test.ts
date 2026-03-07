import { executePipelineFromSource } from "@/src/operations/pipelineExecution";

describe("pipelineExecution", () => {
  it("executes valid source + operations", () => {
    const res = executePipelineFromSource({
      sourceText: JSON.stringify({ n: 1 }),
      sourceFormat: "json",
      operations: [{ id: "add", type: "Add", config: { path: "n", value: 2 } }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.run.output).toEqual({ n: 3 });
  });

  it("returns parse error for invalid source", () => {
    const res = executePipelineFromSource({
      sourceText: "{",
      sourceFormat: "json",
      operations: [],
    });

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(typeof res.parseError).toBe("string");
    expect(res.parseError.length).toBeGreaterThan(0);
  });
});
