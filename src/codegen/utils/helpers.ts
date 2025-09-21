import type { JSONValue } from "../../types/json";

export type Language = "javascript" | "typescript" | "python" | "php" | "go";

export function mapOperator(lang: Language, op: string): string {
  const m: Record<string, Record<string, string>> = {
    javascript: { eq: "===", neq: "!==", gt: ">", lt: "<", gte: ">=", lte: "<=", contains: "includes", in: "includes" },
    typescript: { eq: "===", neq: "!==", gt: ">", lt: "<", gte: ">=", lte: "<=", contains: "includes", in: "includes" },
    python: { eq: "==", neq: "!=", gt: ">", lt: "<", gte: ">=", lte: "<=", contains: "in", in: "in" },
    php: { eq: "===", neq: "!==", gt: ">", lt: "<", gte: ">=", lte: "<=", contains: "in_array", in: "in_array" },
    go: { eq: "==", neq: "!=", gt: ">", lt: "<", gte: ">=", lte: "<=", contains: "contains", in: "contains" },
  };
  return m[lang][op] ?? op;
}

export function literal(lang: Language, v: JSONValue): string {
  if (lang === "javascript" || lang === "typescript") return JSON.stringify(v, null, 2);
  if (lang === "python") return toPythonLiteral(v);
  if (lang === "php") return toPhpLiteral(v);
  // go
  return toGoLiteral(v);
}

function toPythonLiteral(v: JSONValue): string {
  if (v === null) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(toPythonLiteral).join(", ")}]`;
  const entries = Object.entries(v as Record<string, JSONValue>).map(([k, val]) => `${JSON.stringify(k)}: ${toPythonLiteral(val)}`);
  return `{${entries.join(", ")}}`;
}

function toPhpLiteral(v: JSONValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[` + v.map(toPhpLiteral).join(", ") + `]`;
  const entries = Object.entries(v as Record<string, JSONValue>).map(([k, val]) => `${JSON.stringify(k)} => ${toPhpLiteral(val)}`);
  return `[${entries.join(", ")}]`;
}

export function indent(code: string, spaces = 2): string {
  const pad = " ".repeat(spaces);
  return code
    .split("\n")
    .map((l) => (l.length ? pad + l : l))
    .join("\n");
}

function toGoLiteral(v: JSONValue): string {
  if (v === null) return "nil";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) {
    // use []any here; caller should assign into a typed context if needed
    return "[]any{" + v.map(toGoLiteral).join(", ") + "}";
  }
  const entries = Object.entries(v as Record<string, JSONValue>).map(([k, val]) => `${JSON.stringify(k)}: ${toGoLiteral(val)}`);
  return "map[string]any{" + entries.join(", ") + "}";
}
