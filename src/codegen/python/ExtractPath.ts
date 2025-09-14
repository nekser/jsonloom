type Cfg = { path: string };

export default function ExtractPath(cfg: Cfg, varName: string): string {
  const path = cfg.path || "";
  return `// ExtractPath ${JSON.stringify(path)}
${varName} = (${varName} ?? {});
${varName} = ${path ? path.split('.').map((s, i) => i === 0 ? `${varName}[${JSON.stringify(s)}]` : `[${JSON.stringify(s)}]`).join('') : varName};`;
}
