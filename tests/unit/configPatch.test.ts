import type { Operation } from "@/src/operations";
import { applyOperationPatch, asConfigObject, mergeConfigPatch, toConfigPatch } from "@/src/operations/configPatch";

describe("configPatch helpers", () => {
  it("normalizes config object and filters non-json values", () => {
    const fn = () => "x";
    const out = asConfigObject({ ok: 1, bad: fn });
    expect(out).toEqual({ ok: 1 });
  });

  it("merges patch and removes undefined keys", () => {
    const merged = mergeConfigPatch({ a: 1, b: 2 }, { b: undefined, c: 3 });
    expect(merged).toEqual({ a: 1, c: 3 });
  });

  it("converts unknown patch to typed config patch", () => {
    const p = toConfigPatch({ s: "x", n: 1, drop: () => null });
    expect(p).toEqual({ s: "x", n: 1 });
  });

  it("applies operation patch with merged object config", () => {
    const op: Operation = { id: "1", type: "Add", config: { path: "a", value: 1 } };
    const next = applyOperationPatch(op, { config: { value: 2, writeResultTo: "_internal.out" } });
    expect(next.config).toEqual({ path: "a", value: 2, writeResultTo: "_internal.out" });
  });

  it("replaces config when patch config is non-object", () => {
    const op: Operation = { id: "1", type: "Add", config: { path: "a", value: 1 } };
    const next = applyOperationPatch(op, { config: "raw" });
    expect(next.config).toBe("raw");
  });
});
