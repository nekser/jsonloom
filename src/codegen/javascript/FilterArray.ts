import type { JSONValue } from "../../types/json";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; key?: string; operator: string; value: JSONValue; mode?: "keep" | "remove" };

export default function FilterArray(cfg: Cfg, varName: string): string {
  const arr = accessExpr("javascript", varName, cfg.path);
  const key = cfg.key ? (/[A-Za-z_$][A-Za-z0-9_$]*/.test(cfg.key) ? `.${cfg.key}` : `[${JSON.stringify(cfg.key)}]`) : "";
  const jsOp = ((): string => {
    switch (cfg.operator) {
      case "eq": return "===";
      case "neq": return "!==";
      case "gt": return ">";
      case "lt": return "<";
      case "gte": return ">=";
      case "lte": return "<=";
      case "contains": return ".includes";
      case "in": return "in";
      default: return cfg.operator || "===";
    }
  })();
  const cond = cfg.operator === "contains"
    ? `String(item${key}).includes(${JSON.stringify(cfg.value)})`
    : cfg.operator === "in"
    ? `${JSON.stringify(cfg.value)}.includes(item${key})`
    : `item${key} ${jsOp} ${JSON.stringify(cfg.value)}`;
  const base = `${arr}.filter(item => ${cond})`;
  return cfg.mode === "remove" ? `${arr} = ${arr}.filter(item => !(${cond}))` : `${arr} = ${base}`;
}
