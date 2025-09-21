type Cfg = { path: string; template: string; onMissing?: "ignore" | "literal" | "error" };

export default function TemplateInterpolate(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const tmpl = cfg.template ?? "";
  const onMissing = cfg.onMissing ?? "literal";
  const esc = (s: string) => s.replace(/`/g, "\\`").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `// TemplateInterpolate\n__tmpl := "${esc(tmpl)}"\n{
  // simple replacement of ${'${'}...} using getPath against root
  out := strings.Builder{}
  for i := 0; i < len(__tmpl); {
    if i+2 < len(__tmpl) && __tmpl[i] == '$' && __tmpl[i+1] == '{' {
      j := i+2
  for j < len(__tmpl) && __tmpl[j] != '}' { j++ }
      key := strings.TrimSpace(__tmpl[i+2:j])
      v := getPath(__root, key)
      if v == nil {
        switch ${JSON.stringify(onMissing)} {
        case "ignore":
          // skip
        case "error":
          panic("Missing placeholder: " + key)
        default: // literal
          out.WriteString(${"'${'"})
          out.WriteString(key)
          out.WriteString("}")
        }
      } else {
        out.WriteString(fmt.Sprintf("%v", v))
      }
      i = j+1
      continue
    }
    out.WriteByte(__tmpl[i])
    i++
  }
  setPath(&${varName}, ${p}, out.String())
}`;
}
