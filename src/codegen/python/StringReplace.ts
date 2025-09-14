type Cfg = { path?: string; search: string; replace: string };

export default function StringReplace(cfg: Cfg, varName: string): string {
  const search = JSON.stringify(cfg.search ?? "");
  const replace = JSON.stringify(cfg.replace ?? "");
  const body = `def __sr(v):\n  if isinstance(v, str): return v.replace(${search}, ${replace})\n  if isinstance(v, list): return [__sr(x) for x in v]\n  if isinstance(v, dict): return {k: __sr(val) for k, val in v.items()}\n  return v`;
  if (!cfg.path) {
    return `# StringReplace globally\n${body}\n${varName} = __sr(${varName})`;
  }
  const path = cfg.path.split('.').map(s => `[${JSON.stringify(s)}]`).join("");
  return `# StringReplace at path ${JSON.stringify(cfg.path)}\n${body}\n__t = ${varName}${path}\n${varName}${path} = __sr(__t)`;
}
