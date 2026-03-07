import Add from "@/src/codegen/jq/Add";
import CountArray from "@/src/codegen/jq/CountArray";
import Divide from "@/src/codegen/jq/Divide";
import FilterArray from "@/src/codegen/jq/FilterArray";
import MapArray from "@/src/codegen/jq/MapArray";
import SetPath from "@/src/codegen/jq/SetPath";
import StringReplace from "@/src/codegen/jq/StringReplace";
import TrimStrings from "@/src/codegen/jq/TrimStrings";

describe("jq codegen templates", () => {
  it("generates arithmetic/path filters", () => {
    expect(Add({ path: "totals.grand", value: 10 })).toContain('.totals.grand |= ((. // 0) + 10)');
    expect(Divide({ path: "totals.grand", value: 0 })).toContain("if 0 == 0 then . else");
    expect(SetPath({ path: "meta.version", value: "1" })).toContain('setpath(["meta","version"]; "1")');
    expect(CountArray({ path: "items" })).toBe('.items |= (if type == "array" then length else . end)');
  });

  it("generates string/array filters", () => {
    expect(StringReplace({ search: "foo", replace: "bar" })).toContain("(.. | strings) |= gsub");
    expect(TrimStrings({ path: "items" })).toContain('.items |= (if type == "string" then');
    expect(FilterArray({ path: "items", key: "status", operator: "eq", value: "active" })).toContain(
      '.items |= (map(select(.status == "active")))',
    );
  });

  it("generates nested map pipelines through injected generator", () => {
    const prev = (globalThis as Record<string, unknown>).__codegen_generateOp;
    (globalThis as Record<string, unknown>).__codegen_generateOp = () => ".price |= (. + 1)";
    const out = MapArray({
      path: "items",
      operations: [{ id: "n1", type: "Add", config: { path: "price", value: 1 } }],
    });
    expect(out).toBe('.items |= (map(.price |= (. + 1)))');
    (globalThis as Record<string, unknown>).__codegen_generateOp = prev;
  });
});
