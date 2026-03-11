import { getHydrationFromUrl, removeShareQueryParams } from "@/components/operations-panel/hooks";
import { PipelineEncoder } from "@/src/utils/sharing/PipelineEncoder";

describe("getHydrationFromUrl", () => {
  it("hydrates both source data and operations from query params", () => {
    const data = { users: [{ id: 1 }] };
    const pipeline = {
      schemaVersion: 1,
      ops: [{ id: "op-1", type: "ExtractPath", config: { path: "users" } }],
    };
    const url = new URL("http://localhost/");
    url.searchParams.set("data", PipelineEncoder.encode(data));
    url.searchParams.set("pipeline", PipelineEncoder.encode(pipeline));

    const out = getHydrationFromUrl(url);
    expect(out.sourceText).toBe(JSON.stringify(data, null, 2));
    expect(out.operations).toEqual(pipeline.ops);
  });

  it("ignores invalid pipeline payload and keeps valid data payload", () => {
    const data = { orders: [1, 2, 3] };
    const url = new URL("http://localhost/");
    url.searchParams.set("data", PipelineEncoder.encode(data));
    url.searchParams.set("pipeline", "invalid");

    const out = getHydrationFromUrl(url);
    expect(out.sourceText).toBe(JSON.stringify(data, null, 2));
    expect(out.operations).toBeUndefined();
  });

  it("removes share query parameters while preserving other params", () => {
    const url = new URL("http://localhost/?pipeline=abc&data=xyz&tab=editor");
    const changed = removeShareQueryParams(url);
    expect(changed).toBe(true);
    expect(url.searchParams.has("pipeline")).toBe(false);
    expect(url.searchParams.has("data")).toBe(false);
    expect(url.searchParams.get("tab")).toBe("editor");
  });
});
