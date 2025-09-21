type Cfg = { path: string; by?: string; op: "sum" | "avg" | "min" | "max" | "concat" };

export default function ReduceArray(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const by = cfg.by ? JSON.stringify(cfg.by) : null;
  const op = cfg.op;
  const common = `vals := []any{}\nif arr, ok := getPath(${varName}, ${p}).([]any); ok {\n  for _, it := range arr {\n    v := any(it)\n    if ${by ? "true" : "false"} { v = getPath(it, ${by ?? "\"\""}) }\n    vals = append(vals, v)\n  }\n}`;
  if (op === "concat") {
    return `// ReduceArray concat\n${common}\n{
  sb := strings.Builder{}
  for _, v := range vals { sb.WriteString(fmt.Sprintf("%v", v)) }
  setPath(&${varName}, ${p}, sb.String())
}`;
  }
  if (op === "sum" || op === "avg" || op === "min" || op === "max") {
    return `// ReduceArray ${op}\n${common}\n{
  nums := []float64{}
  for _, v := range vals { if f, ok := v.(float64); ok { nums = append(nums, f) } }
  if len(nums) == 0 { setPath(&${varName}, ${p}, 0.0); } else {
    switch ${JSON.stringify(op)} {
    case "sum":
      s := 0.0; for _, n := range nums { s += n }
      setPath(&${varName}, ${p}, s)
    case "avg":
      s := 0.0; for _, n := range nums { s += n }
      setPath(&${varName}, ${p}, s/float64(len(nums)))
    case "min":
      m := nums[0]; for _, n := range nums { if n < m { m = n } }
      setPath(&${varName}, ${p}, m)
    case "max":
      m := nums[0]; for _, n := range nums { if n > m { m = n } }
      setPath(&${varName}, ${p}, m)
    }
  }
}`;
  }
  return `// ReduceArray unsupported op`;
}
