import { accessExpr, assignExpr } from "../utils/pathResolution";

type Cfg = { path: string };

export default function ExtractPath(cfg: Cfg, varName: string): string {
  const t = accessExpr("go", varName, cfg.path || "");
  // Re-root: assign selected value into root var
  return `// ExtractPath ${JSON.stringify(cfg.path)}\n${assignExpr("go", varName, ".", t)}`;
}
