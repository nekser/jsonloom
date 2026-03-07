import { toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string; by?: string; order?: "asc" | "desc" };

export default function SortArray(cfg: Cfg): string {
  const target = toJqFilterPath(cfg.path);
  const base = cfg.by ? `sort_by(${toJqFilterPath(cfg.by, ".")})` : "sort";
  const body = cfg.order === "desc" ? `${base} | reverse` : base;
  return `${target} |= (${body})`;
}
