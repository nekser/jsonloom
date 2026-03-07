import { addToDate, diffBetween, parseWithFormat, siblingPathWithSuffix } from "@/src/operations/dateUtils";

describe("dateUtils", () => {
  it("parses custom format and computes differences", () => {
    const dt = parseWithFormat("2026-03-01", "yyyy-MM-dd");
    expect(dt?.isValid).toBe(true);
    expect(diffBetween("2026-03-01", "2026-03-03", "days")).toBe(2);
  });

  it("adds date units and computes sibling path", () => {
    const plus = addToDate("2026-03-01T00:00:00Z", 2, "days");
    expect(typeof plus).toBe("string");
    expect(siblingPathWithSuffix("order.createdAt", "Iso")).toBe("order.createdAtIso");
  });
});
