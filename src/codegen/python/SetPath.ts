import { literal } from "../utils/helpers";
import type { JSONValue } from "../../types/json";
type Cfg = { path: string; value: JSONValue };

export default function SetPath(cfg: Cfg, varName: string): string {
  const segs = (cfg.path || "").split('.');
  const access = segs.map(s=>`[${JSON.stringify(s)}]`).join('');
  const val = literal("javascript", cfg.value);
  return `// SetPath ${JSON.stringify(cfg.path)}
${varName}${access} = ${val};`;
}
