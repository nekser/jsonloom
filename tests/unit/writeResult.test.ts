import { writeResult } from "@/src/operations/writeResult";

describe("writeResult", () => {
  it("returns computed root when writeResultTo is empty", () => {
    const out = writeResult({ a: 1 }, { a: 2 }, {});
    expect(out).toEqual({ a: 2 });
  });

  it("writes extracted result to original root when writeResultTo is provided", () => {
    const out = writeResult(
      { source: { value: 3 } },
      { source: { value: 10 } },
      { writeResultTo: "_internal.result", valueExtractor: (_orig, result) => (result as { source: { value: number } }).source.value }
    );

    expect(out).toEqual({ source: { value: 3 }, _internal: { result: 10 } });
  });
});
