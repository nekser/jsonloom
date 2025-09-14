type Cfg = { path: string; precision?: number };
import { accessExpr } from "../utils/pathResolution";
export default function Round(cfg: Cfg, varName: string): string {
  const t = accessExpr("python", varName, cfg.path);
  const p = cfg.precision ?? 0;
  return `# Round\n${t} = round(${t}, ${p})`;
}
