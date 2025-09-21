type Cfg = { path: string; compareTo: string | { path: string }; op: "after"|"afterOrEqual"|"before"|"beforeOrEqual"; resultPath?: string };

export default function IsDateCompare(cfg: Cfg, varName: string): string {
  const ap = JSON.stringify(cfg.path || "");
  const bp = typeof cfg.compareTo === "string" ? undefined : JSON.stringify((cfg.compareTo as { path?: string })?.path || "");
  const bLit = typeof cfg.compareTo === "string" ? JSON.stringify(cfg.compareTo) : undefined;
  const outp = JSON.stringify(cfg.resultPath ? cfg.resultPath : cfg.path);
  const op = cfg.op;
  const cmp = op === "after" ? ">" : op === "afterOrEqual" ? ">=" : op === "before" ? "<" : "<=";
  return `// IsDateCompare\n{
  as, _ := getPath(${varName}, ${ap}).(string)
  var bs string
  ${bLit ? `bs = ${bLit}` : `bs, _ = getPath(${varName}, ${bp}).(string)`}
  da, errA := time.Parse(time.RFC3339, as)
  db, errB := time.Parse(time.RFC3339, bs)
  res := false
  if errA == nil && errB == nil {
    if da ${cmp} db { res = true }
  }
  setPath(&${varName}, ${outp}, res)
}`;
}
