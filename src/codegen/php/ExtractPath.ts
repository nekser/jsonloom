import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string };

export default function ExtractPath(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path || "");
  return `${varName} = ${t};`;
}
