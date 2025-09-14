type Cfg = { path: string; mode: "encode" | "decode" };

export default function Base64(cfg: Cfg, varName: string): string {
  const access = (cfg.path || "").split('.').map(s => `[${JSON.stringify(s)}]`).join('');
  if (cfg.mode === "encode") {
    return `# Base64 encode\nimport base64\n${varName}${access} = base64.b64encode(str(${varName}${access} or '').encode('utf-8')).decode('ascii')`;
  } else {
    return `# Base64 decode\nimport base64\n${varName}${access} = base64.b64decode(str(${varName}${access} or '')).decode('utf-8', 'ignore')`;
  }
}
