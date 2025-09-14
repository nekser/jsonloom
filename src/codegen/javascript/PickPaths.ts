type Cfg = { paths: string[] };

export default function PickPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  const lines = paths.map((p) => {
    const segs = p.split('.').map((s) => `[${JSON.stringify(s)}]`).join('');
    return `__out${segs} = ${varName}${segs};`;
  }).join("\n");
  return `// PickPaths
const __out = {};
${lines}
${varName} = __out;`;
}
