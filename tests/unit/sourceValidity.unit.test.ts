import { getSourceJsonValidity } from "@/src/utils/sourceValidity";

describe("getSourceJsonValidity", () => {
  it("returns valid status when sourceError is absent", () => {
    expect(getSourceJsonValidity()).toEqual({
      text: "Valid JSON",
      isValid: true,
      className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900",
    });
  });

  it("returns invalid status when sourceError exists", () => {
    expect(getSourceJsonValidity("Unexpected token }")).toEqual({
      text: "Invalid JSON",
      isValid: false,
      className: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900",
    });
  });

  it("treats size-limit error as invalid", () => {
    expect(getSourceJsonValidity("JSON exceeds 5 MB limit").isValid).toBe(false);
    expect(getSourceJsonValidity("JSON exceeds 5 MB limit").text).toBe("Invalid JSON");
  });
});
