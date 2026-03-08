import { inferJsonSchema } from "@/src/utils/inferJsonSchema";

describe("inferJsonSchema", () => {
  it("infers primitive and object shapes", () => {
    expect(inferJsonSchema({ id: 1, ok: true, name: "A", nothing: null })).toEqual({
      type: "object",
      properties: {
        id: { type: "integer" },
        ok: { type: "boolean" },
        name: { type: "string" },
        nothing: { type: "null" },
      },
      required: ["id", "ok", "name", "nothing"],
      additionalProperties: false,
    });
  });

  it("infers mixed arrays with anyOf items", () => {
    expect(inferJsonSchema([1, "a", 2])).toEqual({
      type: "array",
      items: {
        anyOf: [{ type: "integer" }, { type: "string" }],
      },
    });
  });
});
