type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";

export default function CountArray(cfg: Cfg, varName: string): string {
  const target = accessExpr("python", varName, cfg.path);
  return `# CountArray
${target} = len(${target}) if isinstance(${target}, list) else 0`;
}
