type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";
export default function Sum(cfg: Cfg, varName: string): string {
  const t = accessExpr("python", varName, cfg.path);
  return `# Sum\n${t} = (sum(v for v in (${t} or []) if isinstance(v, (int, float))) if isinstance(${t}, list) else 0)`;
}
