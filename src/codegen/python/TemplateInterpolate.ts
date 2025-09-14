type Cfg = { path: string; template: string; onMissing?: "ignore" | "literal" | "error" };
import { accessExpr } from "../utils/pathResolution";

export default function TemplateInterpolate(cfg: Cfg, varName: string): string {
  const target = accessExpr("python", varName, cfg.path);
  const tmpl = JSON.stringify(cfg.template || "");
  const onMissing = cfg.onMissing || "literal";
  return `# TemplateInterpolate
import re

def __ti_read(root, path):
  cur = root
  for seg in str(path).split('.'):
    if cur is None:
      return None
    if isinstance(cur, (list, tuple)):
      try:
        idx = int(seg)
        cur = cur[idx] if 0 <= idx < len(cur) else None
      except Exception:
        return None
    elif isinstance(cur, dict):
      cur = cur.get(seg)
    else:
      return None
  return cur

def __ti(tpl, root):
  def repl(m):
    p = m.group(1).strip()
    v = __ti_read(root, p)
    if v is None:
      if ${JSON.stringify(onMissing)} == 'ignore':
        return ''
      if ${JSON.stringify(onMissing)} == 'error':
        raise Exception('Missing placeholder: ' + p)
      return '${' + p + '}'
    return str(v)
  return re.sub(r"\\$\\{([^}]+)\\}", repl, tpl)

${target} = __ti(${tmpl}, ${varName})`;
}
