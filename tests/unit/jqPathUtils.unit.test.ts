import { jqLiteral, jqTrimExpr, toJqFilterPath, toJqPathArray } from "@/src/codegen/utils/jq";

describe("jq codegen path helpers", () => {
  it("builds jq filter path for dot/bracket segments", () => {
    expect(toJqFilterPath("orders[0].item-name")).toBe('.orders[0]["item-name"]');
    expect(toJqFilterPath("meta['display name']")).toBe('.meta["display name"]');
  });

  it("builds jq path arrays for setpath/getpath", () => {
    expect(toJqPathArray("orders[0].sku")).toBe('["orders",0,"sku"]');
    expect(toJqPathArray(".")).toBe("[]");
  });

  it("serializes jq literals and trim expression", () => {
    expect(jqLiteral({ a: 1 })).toBe('{"a":1}');
    expect(jqTrimExpr()).toContain("gsub");
  });
});
