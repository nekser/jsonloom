type Cfg = { path: string; template: string; onMissing?: "ignore" | "literal" | "error" };

export default function TemplateInterpolate(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const tmpl = JSON.stringify(cfg.template || "");
  const onMissing = cfg.onMissing || 'literal';
  return `// TemplateInterpolate
const __ti_read = (root, path) => path.split('.').reduce((acc, seg)=> (acc==null? undefined : (Array.isArray(acc)? acc[seg] : (typeof acc==='object'? acc[seg] : undefined))), ${varName});
const __ti = (tpl) => tpl.replace(/\\$\\{([^}]+)\\}/g, (_, p) => {
  const v = __ti_read(${varName}, String(p).trim());
  if (v === undefined) {
    if (${JSON.stringify(onMissing)} === 'ignore') return '';
    if (${JSON.stringify(onMissing)} === 'error') { throw new Error('Missing placeholder: '+p); }
    return '\\${' + p + '}';
  }
  return String(v);
});
${varName}${access} = __ti(${tmpl});`;
}
