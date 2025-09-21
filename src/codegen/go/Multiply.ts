type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Multiply(cfg: Cfg, varName: string): string {
  const t = accessExpr("go", varName, cfg.path);
  return `// Multiply ${JSON.stringify(cfg.path)}\nif v, ok := ${t}.(float64); ok { ${t} = v * ${cfg.value} }`;
}
