type Cfg = { path: string; mode: "encode" | "decode" };

export default function Base64(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  if (cfg.mode === 'encode') {
    return `// Base64 encode
${varName}${access} = (typeof Buffer!=='undefined' ? Buffer.from(String(${varName}${access} ?? ''), 'utf8').toString('base64') : btoa(unescape(encodeURIComponent(String(${varName}${access} ?? '')))));`;
  }
  return `// Base64 decode
try { ${varName}${access} = (typeof Buffer!=='undefined' ? Buffer.from(String(${varName}${access} ?? ''), 'base64').toString('utf8') : decodeURIComponent(escape(atob(String(${varName}${access} ?? ''))))); } catch { /* keep original */ }`;
}
