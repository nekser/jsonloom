type Cfg = { path: string; mode: "encode" | "decode" };

export default function Base64(cfg: Cfg, varName: string): string {
  const access = (cfg.path || "").split('.').map(s => `[${JSON.stringify(s)}]`).join('');
  if (cfg.mode === "encode") {
    return `// Base64 encode
${varName}${access} = btoa(unescape(encodeURIComponent(${varName}${access}||"")));`;
  } else {
    return `// Base64 decode
${varName}${access} = decodeURIComponent(escape(atob(${varName}${access}||"")));`;
  }
}
