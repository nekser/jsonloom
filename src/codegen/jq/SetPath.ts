import { jqLiteral, toJqPathArray } from "../utils/jq";

type Cfg = { path?: string; value?: unknown };

export default function SetPath(cfg: Cfg): string {
  return `setpath(${toJqPathArray(cfg.path)}; ${jqLiteral(cfg.value)})`;
}
