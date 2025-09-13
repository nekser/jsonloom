import { Language } from "./helpers";

// Basic dot-path resolver. Supports '.' for current, 'a.b', and bracket for keys with special chars.
export function accessExpr(lang: Language, base: string, path: string): string {
  if (!path || path === ".") return base;
  const parts = path.split(".");
  if (lang === "javascript") {
    return parts.reduce((acc, p) => (isIdent(p) ? `${acc}.${p}` : `${acc}[${JSON.stringify(p)}]`), base);
  }
  if (lang === "python") {
    return parts.reduce((acc, p) => `${acc}[${JSON.stringify(p)}]`, base);
  }
  // php arrays
  return parts.reduce((acc, p) => `${acc}[${JSON.stringify(p)}]`, base);
}

export function assignExpr(lang: Language, base: string, path: string, rhs: string): string {
  if (!path || path === ".") return `${base} = ${rhs}`;
  const target = accessExpr(lang, base, path);
  return `${target} = ${rhs}`;
}

function isIdent(s: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s);
}
