import type { Operation } from "@/src/operations";
import { getOperationModule } from "@/src/operations";
import { applyOperationPatch, asConfigObject, mergeConfigPatch, sanitizeConfigValue, toConfigPatch } from "@/src/operations/configPatch";

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

  it("sanitizes undefined recursively from config values", () => {
    const out = sanitizeConfigValue({
      keep: 1,
      drop: undefined,
      nested: { a: "x", b: undefined },
      arr: [1, undefined, { ok: true, nope: undefined }],
    });
    expect(out).toEqual({
      keep: 1,
      nested: { a: "x" },
      arr: [1, { ok: true }],
    });
  });

  it("keeps nested operations serializable when defaults contain undefined keys", () => {
    const nested = {
      id: "nested-1",
      type: "MapArray",
      config: sanitizeConfigValue(getOperationModule("MapArray")?.defaultConfig, {}),
    };
    const cfg = { operations: [nested] };
    expect(asConfigObject(cfg)).toEqual(cfg);
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
