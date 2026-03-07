import { jqLiteral, toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string; value?: number };

export default function Subtract(cfg: Cfg): string {
  return `${toJqFilterPath(cfg.path)} |= ((. // 0) - ${jqLiteral(cfg.value ?? 0)})`;
}
