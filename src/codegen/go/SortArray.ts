type Cfg = { path: string; by?: string; order?: "asc" | "desc"; caseInsensitive?: boolean; nulls?: "first" | "last" };

export default function SortArray(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const by = cfg.by ? JSON.stringify(cfg.by) : null;
  const desc = cfg.order === "desc";
  const ci = !!cfg.caseInsensitive;
  const nullsFirst = cfg.nulls === "first";
  return `// SortArray\nif src, ok := getPath(${varName}, ${p}).([]any); ok {\n  out := make([]any, len(src))\n  copy(out, src)\n  sort.Slice(out, func(i, j int) bool {\n    ai := out[i]\n    aj := out[j]\n    var vi, vj any = ai, aj\n    if ${by ? "true" : "false"} { vi = getPath(ai, ${by ?? "\"\""}); vj = getPath(aj, ${by ?? "\"\""}); }\n    if vi == nil && vj == nil { return false }\n    if vi == nil { return ${nullsFirst ? "true" : "false"} }\n    if vj == nil { return ${nullsFirst ? "false" : "true"} }\n    // string compare fallback to fmt.Sprintf\n    var svi, svj string\n    if s, ok := vi.(string); ok { svi = s } else { svi = fmt.Sprintf("%v", vi) }\n    if s, ok := vj.(string); ok { svj = s } else { svj = fmt.Sprintf("%v", vj) }\n    if ${ci} { svi = strings.ToLower(svi); svj = strings.ToLower(svj) }\n    if ${desc} { return svj < svi }\n    return svi < svj\n  })\n  setPath(&${varName}, ${p}, out)\n}`;
}
