import { jqLiteral, toJqFilterPath } from "../utils/jq";

type Operator = "eq" | "neq" | "gt" | "lt" | "in" | "contains";
type Cfg = { path?: string; key?: string; operator?: Operator; value?: unknown; mode?: "keep" | "remove" };

function predicate(lhs: string, operator: Operator, rhs: string): string {
  if (operator === "neq") return `${lhs} != ${rhs}`;
  if (operator === "gt") return `${lhs} > ${rhs}`;
  if (operator === "lt") return `${lhs} < ${rhs}`;
  if (operator === "in") return `try ((${rhs} | index(${lhs})) != null) catch false`;
  if (operator === "contains") return `try (${lhs} | contains(${rhs})) catch false`;
  return `${lhs} == ${rhs}`;
}

export default function FilterArray(cfg: Cfg): string {
  const target = toJqFilterPath(cfg.path);
  const lhs = cfg.key ? toJqFilterPath(cfg.key, ".") : ".";
  const pred = predicate(lhs, cfg.operator ?? "eq", jqLiteral(cfg.value));
  const keep = cfg.mode !== "remove";
  return `${target} |= (map(select(${keep ? pred : `(${pred}) | not`})))`;
}
