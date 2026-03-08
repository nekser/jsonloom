import { applyOperation } from "@/tests/helpers/runner";

describe("ValidateJSON (unit)", () => {
  it("validates against manual schema", () => {
    const input = { user: { id: 1 } };
    const op = {
      type: "ValidateJSON" as const,
      config: { path: "user", schema: { type: "object", required: ["id"], properties: { id: { type: "number" } } } },
    };

    expect(applyOperation(input, op)).toEqual(input);
  });

  it("throws when schema validation fails in fail mode", () => {
    const input = { user: { id: "x" } };
    const op = {
      type: "ValidateJSON" as const,
      config: { path: "user", schema: { type: "object", required: ["id"], properties: { id: { type: "number" } } }, failOnError: true },
    };

    expect(() => applyOperation(input, op)).toThrow();
  });

  it("infers schema when generateSchema is enabled", () => {
    const input = { user: { id: 1, name: "Alice" } };
    const op = {
      type: "ValidateJSON" as const,
      config: { path: "user", generateSchema: true, failOnError: true },
    };

    expect(() => applyOperation(input, op)).not.toThrow();
  });
});
