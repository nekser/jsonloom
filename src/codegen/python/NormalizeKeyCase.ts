type Cfg = { mode: "camel" | "snake" | "kebab" | "pascal" };

export default function NormalizeKeyCase(cfg: Cfg, varName: string): string {
  const mode = JSON.stringify(cfg.mode || 'camel');
  return `# NormalizeKeyCase (${cfg.mode})\nimport re\n\n`+
`def __parts(s):\n`+
`  s = re.sub(r'([a-z0-9])([A-Z])', r'\\1_\\2', str(s))\n`+
`  return [p.lower() for p in re.split(r'[^A-Za-z0-9]+', s) if p]`+
`\n\n`+
`def __to_case(s, mode):\n`+
`  ps = __parts(s)\n`+
`  if mode == 'camel':\n`+
`    return ''.join([ps[0]] + [p.capitalize() for p in ps[1:]]) if ps else ''\n`+
`  if mode == 'snake':\n`+
`    return '_'.join(ps)\n`+
`  if mode == 'kebab':\n`+
`    return '-'.join(ps)\n`+
`  if mode == 'pascal':\n`+
`    return ''.join([p.capitalize() for p in ps])\n`+
`  return s`+
`\n\n`+
`def __nkc(v):\n`+
`  if isinstance(v, list):\n`+
`    return [__nkc(x) for x in v]\n`+
`  if isinstance(v, dict):\n`+
`    return { __to_case(k, ${mode}): __nkc(val) for k, val in v.items() }\n`+
`  return v`+
`\n`+
`${varName} = __nkc(${varName})`;
}
