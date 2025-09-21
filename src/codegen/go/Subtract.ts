type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Subtract(cfg: Cfg, varName: string): string {
  const t = accessExpr("go", varName, cfg.path);
  return `// Subtract ${JSON.stringify(cfg.path)}\nif v, ok := ${t}.(float64); ok { ${t} = v - ${cfg.value} }`;
}
