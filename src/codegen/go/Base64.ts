type Cfg = { path: string; mode: "encode" | "decode" };

export default function Base64(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  if (cfg.mode === "encode") {
    return `// Base64 encode\nif s, ok := getPath(${varName}, ${p}).(string); ok { setPath(&${varName}, ${p}, base64.StdEncoding.EncodeToString([]byte(s))) }`;
  }
  return `// Base64 decode\nif s, ok := getPath(${varName}, ${p}).(string); ok { if b, err := base64.StdEncoding.DecodeString(s); err == nil { setPath(&${varName}, ${p}, string(b)) } }`;
}
