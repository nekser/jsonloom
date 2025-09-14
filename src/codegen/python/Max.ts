type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";
export default function Max(cfg: Cfg, varName: string): string {
  const t = accessExpr("python", varName, cfg.path);
  return `# Max\n${t} = (max([v for v in (${t} or []) if isinstance(v, (int, float))]) if isinstance(${t}, list) and any(isinstance(v,(int,float)) for v in (${t} or [])) else None)`;
}
