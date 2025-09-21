type Cfg = { path: string; delimiter?: string };

export default function UnflattenObject(cfg: Cfg, varName: string): string {
  const delim = cfg.delimiter ?? ".";
  const p = JSON.stringify(cfg.path || "");
  const esc = (s: string) => s.replace(/"/g, '\\"');
  return `// UnflattenObject\nif m, ok := getPath(${varName}, ${p}).(map[string]any); ok {\n  out := map[string]any{}\n  for fk, v := range m {\n    segs := strings.Split(fk, "${esc(delim)}")\n    cur := out\n    for i, s := range segs {\n       if i == len(segs)-1 { cur[s] = v } else {\n         if next, ok := cur[s].(map[string]any); ok { cur = next } else { nm := map[string]any{}; cur[s] = nm; cur = nm }\n       }\n    }\n  }\n  setPath(&${varName}, ${p}, out)\n}`;
}
