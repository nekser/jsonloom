type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Add(cfg: Cfg, varName: string): string {
  const t = accessExpr("go", varName, cfg.path);
  // best-effort numeric add using helper getPath; leave typing to user if needed
  return `// Add ${JSON.stringify(cfg.path)}\nif v, ok := ${t}.(float64); ok { ${t} = v + ${cfg.value} }`;
}
