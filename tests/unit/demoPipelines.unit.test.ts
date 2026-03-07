import fs from "node:fs";
import path from "node:path";
import { executePipelineFromSource } from "@/src/operations/pipelineExecution";

type SerializedPipeline = { v: 1; ops: Array<{ id: string; type: string; config: unknown }> };

function loadFixture(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("demo pipelines", () => {
  it("runs user demo pipeline against user demo data", () => {
    const sourceText = loadFixture("public/demo/demo.json");
    const pipeline = JSON.parse(loadFixture("public/demo/pipeline.json")) as SerializedPipeline;
    const res = executePipelineFromSource({ sourceText, sourceFormat: "json", operations: pipeline.ops });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.run.error).toBeUndefined();
  });

  it("runs e-commerce demo pipeline against e-commerce demo data", () => {
    const sourceText = loadFixture("public/demo/vars-data.json");
    const pipeline = JSON.parse(loadFixture("public/demo/vars-pipeline.json")) as SerializedPipeline;
    const res = executePipelineFromSource({ sourceText, sourceFormat: "json", operations: pipeline.ops });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.run.error).toBeUndefined();
  });
});
