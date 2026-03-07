import { toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string; start?: number; end?: number; step?: number };

export default function SliceArray(cfg: Cfg): string {
  const target = toJqFilterPath(cfg.path);
  const start = Number.isFinite(cfg.start) ? Math.trunc(cfg.start as number) : 0;
  const hasEnd = Number.isFinite(cfg.end);
  const end = hasEnd ? Math.trunc(cfg.end as number) : undefined;
  const step = Number.isFinite(cfg.step) && (cfg.step as number) > 1 ? Math.trunc(cfg.step as number) : 1;
  if (step <= 1) {
    return `${target} |= (.[${start}:${end ?? ""}])`;
  }
  const endExpr = end == null ? "length" : String(end);
  return `${target} |= (to_entries | map(select(.key >= ${start} and .key < ${endExpr} and ((.key - ${start}) % ${step} == 0))) | map(.value))`;
}
