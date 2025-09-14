type Cfg = { path?: string; pattern: string; replace: string; flags?: string };

export default function RegexReplace(cfg: Cfg, varName: string): string {
  const pattern = JSON.stringify(cfg.pattern ?? "");
  const replace = JSON.stringify(cfg.replace ?? "");
  // Map JS-style flags to Python re flags minimally: i -> re.IGNORECASE, m -> re.MULTILINE; others ignored here
  const flags = cfg.flags || "";
  const flagExpr = [
    flags.includes('i') ? 're.IGNORECASE' : '',
    flags.includes('m') ? 're.MULTILINE' : '',
  ].filter(Boolean).join(' | ') || '0';
  const body = `import re\n__rr_re = re.compile(${pattern}, ${flagExpr})\n\n`+
`def __rr(v):\n`+
`  if isinstance(v, str):\n`+
`    return __rr_re.sub(${replace}, v)\n`+
`  if isinstance(v, (list, tuple)):\n`+
`    return [__rr(x) for x in v]\n`+
`  if isinstance(v, dict):\n`+
`    return {k: __rr(val) for k, val in v.items()}\n`+
`  return v`;
  if (!cfg.path) {
    return `# RegexReplace globally\n${body}\n${varName} = __rr(${varName})`;
  }
  const path = cfg.path.split('.').map(s => `[${JSON.stringify(s)}]`).join("");
  return `# RegexReplace at path ${JSON.stringify(cfg.path)}\n${body}\n__t = ${varName}${path}\n${varName}${path} = __rr(__t)`;
}
