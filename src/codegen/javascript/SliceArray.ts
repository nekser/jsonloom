type Cfg = { path: string; start?: number; end?: number; step?: number };

export default function SliceArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const start = cfg.start ?? 0;
  if (!cfg.step || cfg.step === 1) {
    return `// SliceArray
${varName}${access} = (${varName}${access}||[]).slice(${start}${cfg.end !== undefined ? ", "+cfg.end : ""});`;
  }
  return `// SliceArray with step
{
  const __src = (${varName}${access}||[]);
  const __out = [];
  for (let i=${start}; i<${cfg.end ?? "__src.length"}; i+=${cfg.step}) __out.push(__src[i]);
  ${varName}${access} = __out;
}`;
}
