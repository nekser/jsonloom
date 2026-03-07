import { resolveConfig } from "@/src/operations/configResolver";
import { resetVarContext, setVar } from "@/src/operations/varContext";

describe("resolveConfig", () => {
  beforeEach(() => resetVarContext());

  it("resolves root/current expressions and arithmetic", () => {
    const out = resolveConfig(
      {
        id: "${root.user.id}",
        sum: "${current.a + current.b}",
        msg: "hello ${root.user.name}",
      },
      { root: { user: { id: 7, name: "Alice" } }, current: { a: 3, b: 5 } as unknown as never }
    );

    expect(out).toEqual({ id: 7, sum: 8, msg: "hello Alice" });
  });

  it("resolves vars and preserves unresolved placeholders in template strings", () => {
    setVar("country", "FI");
    const out = resolveConfig({ value: "${vars.country}", text: "x ${root.missing} y" }, { root: {} as never });
    expect(out).toEqual({ value: "FI", text: "x ${root.missing} y" });
  });
});
