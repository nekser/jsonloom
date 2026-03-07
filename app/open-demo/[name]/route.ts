import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { PipelineEncoder } from "@/src/utils/sharing/PipelineEncoder";

type DemoName = "user-data" | "ecommerce" | "date-functions";

const demoMap: Record<DemoName, { dataFile: string; pipelineFile: string }> = {
  "user-data": { dataFile: "demo.json", pipelineFile: "pipeline.json" },
  ecommerce: { dataFile: "vars-data.json", pipelineFile: "vars-pipeline.json" },
  "date-functions": { dataFile: "demo.json", pipelineFile: "pipeline.json" },
};

async function loadJson(file: string): Promise<unknown> {
  const fullPath = join(process.cwd(), "public", "demo", file);
  const text = await readFile(fullPath, "utf8");
  return JSON.parse(text) as unknown;
}

export async function GET(request: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  if (!(name in demoMap)) {
    return NextResponse.redirect(new URL("/docs/sharing", request.url), 302);
  }

  const key = name as DemoName;
  const map = demoMap[key];

  const [data, pipeline] = await Promise.all([loadJson(map.dataFile), loadJson(map.pipelineFile)]);
  const dataEnc = PipelineEncoder.encode(data);
  const pipelineEnc = PipelineEncoder.encode(pipeline);
  const redirect = `/free?pipeline=${pipelineEnc}&data=${dataEnc}`;

  return NextResponse.redirect(new URL(redirect, request.url), 302);
}
