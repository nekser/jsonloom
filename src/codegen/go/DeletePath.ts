import { assignExpr } from "../utils/pathResolution";

type Cfg = { path: string };

export default function DeletePath(cfg: Cfg, varName: string): string {
  // Best-effort: set to nil; prune is not automatic in go helpers (out of scope)
  return `// DeletePath ${JSON.stringify(cfg.path)}\n${assignExpr("go", varName, cfg.path, "nil")}`;
}
