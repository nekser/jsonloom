type Cfg = { path: string; amount: number; unit: "seconds"|"minutes"|"hours"|"days"|"weeks"|"months"|"years" };
import { accessExpr } from "../utils/pathResolution";

function unitToSpec(u: Cfg["unit"], n: number): string {
  switch (u) {
    case "seconds": return `${n} seconds`;
    case "minutes": return `${n} minutes`;
    case "hours": return `${n} hours`;
    case "days": return `${n} days`;
    case "weeks": return `${n} weeks`;
    case "months": return `${n} months`;
    case "years": return `${n} years`;
  }
}

export default function DateAdd(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const spec = unitToSpec(cfg.unit, cfg.amount);
  return `${t} = date('c', strtotime(${JSON.stringify("+" + spec)}, strtotime(${t})));`;
}
