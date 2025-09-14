type Cfg = { path?: string; schema?: unknown; failOnError?: boolean };

export default function ValidateJSON(cfg: Cfg, _varName: string): string {
  return `// ValidateJSON (not executed in template). Schema preview: ${JSON.stringify(cfg.schema || {})}`;
}
