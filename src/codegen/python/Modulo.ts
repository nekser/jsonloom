type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Modulo(cfg: Cfg, varName: string): string {
  const t = accessExpr("python", varName, cfg.path);
  return `# Modulo\n${t} = (${t}) % ${cfg.value}`;
}
