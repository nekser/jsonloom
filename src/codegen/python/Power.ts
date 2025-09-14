type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Power(cfg: Cfg, varName: string): string {
  const t = accessExpr("python", varName, cfg.path);
  return `# Power\n${t} = (${t}) ** ${cfg.value}`;
}
