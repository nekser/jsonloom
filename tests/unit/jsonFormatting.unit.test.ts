import { formatJsonText, isTextWithinByteLimit } from "@/src/utils/jsonFormatting";

describe("jsonFormatting", () => {
  it("beautifies valid JSON", () => {
    const out = formatJsonText('{"user":{"id":1},"items":[1,2]}', "pretty");
    expect(out).toEqual({
      ok: true,
      text: '{\n  "user": {\n    "id": 1\n  },\n  "items": [\n    1,\n    2\n  ]\n}',
    });
  });

  it("minifies valid JSON", () => {
    const out = formatJsonText('{\n  "user": {\n    "id": 1\n  },\n  "items": [1, 2]\n}', "minified");
    expect(out).toEqual({
      ok: true,
      text: '{"user":{"id":1},"items":[1,2]}',
    });
  });

  it("returns parse error for invalid JSON", () => {
    const out = formatJsonText("{ invalid }", "pretty");
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.error).toBeTruthy();
    }
  });

  it("rejects formatted output that exceeds byte limit", () => {
    const out = formatJsonText('{"payload":"1234567890"}', "pretty");
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(isTextWithinByteLimit(out.text, 8)).toBe(false);
    }
  });
});
