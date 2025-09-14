import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string };

export default function DeletePath(cfg: Cfg, varName: string): string {
  const segs = (cfg.path || "").split(".");
  const headPath = segs.slice(0, -1).join(".");
  const head = accessExpr("php", varName, headPath);
  const last = segs[segs.length - 1] ?? "";
  return `if (is_array(${head})) { unset(${head}[${JSON.stringify(last)}]); }`;
}
