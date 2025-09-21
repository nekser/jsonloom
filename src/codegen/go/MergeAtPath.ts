type Cfg = { path: string; source: "root" | "path"; sourcePath?: string; strategy?: "shallow" | "deep" | "overwrite" };

export default function MergeAtPath(cfg: Cfg, varName: string): string {
  const dest = JSON.stringify(cfg.path || "");
  const srcExpr = cfg.source === "root" ? varName : `getPath(${varName}, ${JSON.stringify(cfg.sourcePath || "")})`;
  const strat = cfg.strategy || "shallow";
  return `// MergeAtPath (${strat})\n{
  dst, _ := getPath(${varName}, ${dest}).(map[string]any)
  src, _ := ${srcExpr}.(map[string]any)
  if ${JSON.stringify(strat)} == "overwrite" {
    if src != nil { setPath(&${varName}, ${dest}, src) }
  } else if ${JSON.stringify(strat)} == "deep" {
    out := map[string]any{}
    if dst != nil { for k, v := range dst { out[k] = v } }
    if src != nil {
      for k, v := range src {
        if vmap, ok := v.(map[string]any); ok {
          if dsub, ok := out[k].(map[string]any); ok {
            // shallow merge nested as deep minimal
            sub := map[string]any{}
            for sk, sv := range dsub { sub[sk] = sv }
            for sk, sv := range vmap { sub[sk] = sv }
            out[k] = sub
          } else { out[k] = v }
        } else { out[k] = v }
      }
    }
    setPath(&${varName}, ${dest}, out)
  } else { // shallow
    out := map[string]any{}
    if dst != nil { for k, v := range dst { out[k] = v } }
    if src != nil { for k, v := range src { out[k] = v } }
    setPath(&${varName}, ${dest}, out)
  }
}`;
}
