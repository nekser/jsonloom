import { jqTrimExpr, toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string };

export default function TrimStrings(cfg: Cfg): string {
  const trimExpr = jqTrimExpr();
  if (!cfg.path) return `(.. | strings) |= ${trimExpr}`;
  const target = toJqFilterPath(cfg.path);
  return `${target} |= (if type == "string" then ${trimExpr} elif type == "array" then map(if type == "string" then ${trimExpr} else . end) elif type == "object" then ((.. | strings) |= ${trimExpr}) else . end)`;
}
