import { jqLiteral, toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string; value?: number };

export default function Divide(cfg: Cfg): string {
  const value = jqLiteral(cfg.value ?? 1);
  return `${toJqFilterPath(cfg.path)} |= (if ${value} == 0 then . else ((. // 0) / ${value}) end)`;
}
