type Cfg = { pattern: string; replace: string; flags?: string };

export default function RenameKeysByPattern(cfg: Cfg, varName: string): string {
  const pattern = JSON.stringify(cfg.pattern || "");
  const replace = JSON.stringify(cfg.replace || "");
  const flags = cfg.flags || "";
  const flagExpr = [
    flags.includes('i') ? 're.IGNORECASE' : '',
    flags.includes('m') ? 're.MULTILINE' : '',
  ].filter(Boolean).join(' | ') || '0';
  return `# RenameKeysByPattern\nimport re\n__rkbp_re = re.compile(${pattern}, ${flagExpr})\n\n`+
`def __rkbp(v):\n`+
`  if isinstance(v, list): return [__rkbp(x) for x in v]\n`+
`  if isinstance(v, dict): return { __rkbp_re.sub(${replace}, k): __rkbp(val) for k, val in v.items() }\n`+
`  return v\n`+
`${varName} = __rkbp(${varName})`;
}
