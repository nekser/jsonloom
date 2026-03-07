import type { Operation } from "../../operations/types";
import { toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string; operations?: Operation[] };

export default function MapArray(cfg: Cfg): string {
  const target = toJqFilterPath(cfg.path);
  const nested = (cfg.operations ?? [])
    .map((op) => generateNested("jq", op, "."))
    .join(" | ");
  return `${target} |= (map(${nested || "."}))`;
}

function generateNested(lang: "jq", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return ".";
}
