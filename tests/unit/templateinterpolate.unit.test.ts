import { applyOperation } from "@/tests/helpers/runner";

describe("TemplateInterpolate (unit)", () => {
  it("interpolates placeholders and writes to path", () => {
    const input = { user: { first: "Ada", last: "Lovelace" }, msg: "" };
    const op = {
      type: "TemplateInterpolate" as const,
      config: { path: "msg", template: "Hello {{user.first}} {{user.last}}" },
    };

    expect(applyOperation(input, op)).toEqual({ user: { first: "Ada", last: "Lovelace" }, msg: "Hello Ada Lovelace" });
  });

  it("throws in error mode when placeholder is missing", () => {
    const input = { user: { first: "Ada" }, msg: "" };
    const op = {
      type: "TemplateInterpolate" as const,
      config: { path: "msg", template: "{{user.last}}", onMissing: "error" },
    };

    expect(() => applyOperation(input, op)).toThrow("Missing placeholder");
  });
});
