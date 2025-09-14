import { assignExpr } from "../utils/pathResolution";
import { literal } from "../utils/helpers";
import type { JSONValue } from "../../types/json";

type Cfg = { path: string; value: JSONValue };

export default function SetPath(cfg: Cfg, varName: string): string {
  const rhs = literal("php", cfg.value);
  return assignExpr("php", varName, cfg.path, rhs) + ";";
}
