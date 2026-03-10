import { isDocsAndCodegenEnabled, parseBooleanFlag } from "@/src/config/features";

describe("feature flag parsing", () => {
  it("treats true and 1 as enabled", () => {
    expect(parseBooleanFlag("true")).toBe(true);
    expect(parseBooleanFlag("TRUE")).toBe(true);
    expect(parseBooleanFlag("1")).toBe(true);
    expect(isDocsAndCodegenEnabled("true")).toBe(true);
    expect(isDocsAndCodegenEnabled("1")).toBe(true);
  });

  it("defaults to disabled for unset and false-like values", () => {
    expect(parseBooleanFlag(undefined)).toBe(false);
    expect(parseBooleanFlag("")).toBe(false);
    expect(parseBooleanFlag("false")).toBe(false);
    expect(parseBooleanFlag("0")).toBe(false);
    expect(isDocsAndCodegenEnabled(undefined)).toBe(false);
    expect(isDocsAndCodegenEnabled("0")).toBe(false);
  });
});
