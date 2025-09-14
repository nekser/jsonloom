type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";
export default function Min(cfg: Cfg, varName: string): string {
  const t = accessExpr("python", varName, cfg.path);
  return `# Min\n${t} = (min([v for v in (${t} or []) if isinstance(v, (int, float))]) if isinstance(${t}, list) and any(isinstance(v,(int,float)) for v in (${t} or [])) else None)`;
}
