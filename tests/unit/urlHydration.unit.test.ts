import { getHydrationFromUrl } from "@/components/operations-panel/hooks";
import { PipelineEncoder } from "@/src/utils/sharing/PipelineEncoder";

describe("getHydrationFromUrl", () => {
  it("hydrates both source data and operations from query params", () => {
    const data = { users: [{ id: 1 }] };
    const pipeline = {
      v: 1,
      ops: [{ id: "op-1", type: "ExtractPath", config: { path: "users" } }],
    };
    const url = new URL("http://localhost/free");
    url.searchParams.set("data", PipelineEncoder.encode(data));
    url.searchParams.set("pipeline", PipelineEncoder.encode(pipeline));

    const out = getHydrationFromUrl(url);
    expect(out.sourceText).toBe(JSON.stringify(data, null, 2));
    expect(out.operations).toEqual(pipeline.ops);
  });

  it("ignores invalid pipeline payload and keeps valid data payload", () => {
    const data = { orders: [1, 2, 3] };
    const url = new URL("http://localhost/free");
    url.searchParams.set("data", PipelineEncoder.encode(data));
    url.searchParams.set("pipeline", "invalid");

    const out = getHydrationFromUrl(url);
    expect(out.sourceText).toBe(JSON.stringify(data, null, 2));
    expect(out.operations).toBeUndefined();
  });
});
