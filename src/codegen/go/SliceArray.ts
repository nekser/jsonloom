type Cfg = { path: string; start?: number; end?: number; step?: number };

export default function SliceArray(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const start = typeof cfg.start === "number" ? cfg.start : 0;
  const endExpr = cfg.end === undefined ? `-1` : `${cfg.end}`;
  const step = typeof cfg.step === "number" && cfg.step !== 0 ? cfg.step : 1;
  return `// SliceArray\nif src, ok := getPath(${varName}, ${p}).([]any); ok {\n  out := []any{}\n  n := len(src)\n  end := ${endExpr}\n  if end < 0 || end > n { end = n }\n  for i:=${start}; i<end; i+=${step} { out = append(out, src[i]) }\n  setPath(&${varName}, ${p}, out)\n}`;
}
