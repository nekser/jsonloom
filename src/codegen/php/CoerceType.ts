type Cfg = { path: string; to: "string" | "number" | "boolean" };
import { accessExpr } from "../utils/pathResolution";

export default function CoerceType(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  switch (cfg.to) {
    case "string":
      return `${t} = strval(${t});`;
    case "number":
      return `${t} = is_numeric(${t}) ? 0 + ${t} : 0;`;
    case "boolean":
      return `${t} = (bool)(${t});`;
    default:
      return `// Unsupported CoerceType`;
  }
}
