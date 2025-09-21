type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Power(cfg: Cfg, varName: string): string {
  const t = accessExpr("go", varName, cfg.path);
  return `// Power ${JSON.stringify(cfg.path)}\nif v, ok := ${t}.(float64); ok { ${t} = float64(int(v) ^ int(${cfg.value})) }`;
}
