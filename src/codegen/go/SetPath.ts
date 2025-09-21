import type { JSONValue } from "../../types/json";
import { literal } from "../utils/helpers";
import { assignExpr } from "../utils/pathResolution";

type Cfg = { path: string; value: JSONValue };

export default function SetPath(cfg: Cfg, varName: string): string {
  const rhs = literal("go", cfg.value);
  return `// SetPath ${JSON.stringify(cfg.path)}\n${assignExpr("go", varName, cfg.path, rhs)}`;
}
