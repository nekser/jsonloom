type Cfg = { pathA: string; pathB: string; unit: "seconds"|"minutes"|"hours"|"days" };
import { accessExpr } from "../utils/pathResolution";

export default function DateDiff(cfg: Cfg, varName: string): string {
  const a = accessExpr("php", varName, cfg.pathA);
  const b = accessExpr("php", varName, cfg.pathB);
  const diff = `(strtotime(${a}) - strtotime(${b}))`;
  switch (cfg.unit) {
    case "minutes": return `${a} = ${diff} / 60;`;
    case "hours": return `${a} = ${diff} / 3600;`;
    case "days": return `${a} = ${diff} / 86400;`;
    default: return `${a} = ${diff};`;
  }
}
