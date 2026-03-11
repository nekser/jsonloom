import { containsInternalShareParams, sanitizeTelemetryEvent, sanitizeTelemetryUrl } from "@/src/privacy/telemetry";

describe("privacy telemetry helpers", () => {
  it("strips query and hash fragments from absolute URLs", () => {
    const sanitized = sanitizeTelemetryUrl("https://example.com/?pipeline=abc&tab=main#section");
    expect(sanitized).toBe("https://example.com/");
  });

  it("strips query and hash fragments from relative URLs", () => {
    const sanitized = sanitizeTelemetryUrl("/docs/sharing?data=abc#top");
    expect(sanitized).toBe("/docs/sharing");
  });

  it("detects internal share query parameters", () => {
    expect(containsInternalShareParams("/?data=abc")).toBe(true);
    expect(containsInternalShareParams("/?pipeline=abc")).toBe(true);
    expect(containsInternalShareParams("/?tab=main")).toBe(false);
  });

  it("sanitizes telemetry events", () => {
    const event = { type: "pageview", url: "https://example.com/?data=abc" } as const;
    expect(sanitizeTelemetryEvent(event)).toEqual({ type: "pageview", url: "https://example.com/" });
  });

  it("drops malformed telemetry events", () => {
    const event = { type: "pageview", url: "http://%" } as const;
    expect(sanitizeTelemetryEvent(event)).toBeNull();
  });
});

