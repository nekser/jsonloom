type Cfg = { leftPath: string; rightPath: string; operator: "eq"|"neq"|"gt"|"lt"|"gte"|"lte"; resultPath?: string };
import { accessExpr, assignExpr } from "../utils/pathResolution";

export default function IsDateCompare(cfg: Cfg, varName: string): string {
  const left = `strtotime(${accessExpr("php", varName, cfg.leftPath)})`;
  const right = `strtotime(${accessExpr("php", varName, cfg.rightPath)})`;
  const cmp = (() => {
    switch (cfg.operator) {
      case "eq": return `${left} === ${right}`;
      case "neq": return `${left} !== ${right}`;
      case "gt": return `${left} > ${right}`;
      case "lt": return `${left} < ${right}`;
      case "gte": return `${left} >= ${right}`;
      case "lte": return `${left} <= ${right}`;
    }
  })();
  if (cfg.resultPath) {
    const assign = assignExpr("php", varName, cfg.resultPath, cmp ?? "false");
    return `${assign};`;
  }
  return `// ${cmp}`;
}
