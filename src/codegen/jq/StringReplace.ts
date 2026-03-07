import { jqLiteral, toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string; search?: string; replace?: string };

export default function StringReplace(cfg: Cfg): string {
  const search = jqLiteral(cfg.search ?? "");
  const replace = jqLiteral(cfg.replace ?? "");
  const replaceExpr = `gsub(${search}; ${replace})`;
  if (!cfg.path) return `(.. | strings) |= ${replaceExpr}`;
  const target = toJqFilterPath(cfg.path);
  return `${target} |= (if type == "string" then ${replaceExpr} elif type == "array" then map(if type == "string" then ${replaceExpr} else . end) elif type == "object" then ((.. | strings) |= ${replaceExpr}) else . end)`;
}
