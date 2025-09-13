type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";

export default function Multiply(cfg: Cfg, varName: string): string {
  const target = accessExpr("javascript", varName, cfg.path);
  return `${target} = ${target} * ${cfg.value}`;
}
