type Cfg = { path: string; start?: number; end?: number; step?: number };
import { accessExpr } from "../utils/pathResolution";

export default function SliceArray(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const start = cfg.start ?? 0;
  if (!cfg.step || cfg.step === 1) {
    const end = cfg.end !== undefined ? cfg.end : undefined;
    if (end === undefined) return `${t} = array_slice((array)${t}, ${start});`;
    return `${t} = array_slice((array)${t}, ${start}, ${end - start});`;
  }
  return `$_src = (array)${t};\n$_out = [];\nfor ($i = ${start}; $i < ${cfg.end ?? "count($_src)"}; $i += ${cfg.step}) { $_out[] = $_src[$i]; }\n${t} = $_out;`;
}
