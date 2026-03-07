import { evaluatePredicate } from "@/src/operations/predicateUtils";

describe("evaluatePredicate", () => {
  it("handles numeric-aware equality and comparisons", () => {
    expect(evaluatePredicate({ price: "10" }, "price", "eq", 10)).toBe(true);
    expect(evaluatePredicate({ price: 10 }, "price", "gt", 9)).toBe(true);
    expect(evaluatePredicate({ price: 10 }, "price", "lt", 11)).toBe(true);
  });

  it("handles contains and in operators", () => {
    expect(evaluatePredicate({ tags: ["a", 2] }, "tags", "contains", "a")).toBe(true);
    expect(evaluatePredicate({ code: 2 }, "code", "in", ["1", 2, 3])).toBe(true);
  });
});
