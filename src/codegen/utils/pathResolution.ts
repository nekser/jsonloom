import { Language } from "./helpers";

type Segment = { kind: "key"; key: string } | { kind: "index"; index: number };

function tokenize(path: string): Segment[] {
  const out: Segment[] = [];
  const re = /([^.\[\]]+)|(\[(?:\d+|"[^"\\]*"|'[^'\\]*')\])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path))) {
    if (m[1]) {
      out.push({ kind: "key", key: m[1] });
    } else if (m[2]) {
      const raw = m[2].slice(1, -1);
      if (/^\d+$/.test(raw)) out.push({ kind: "index", index: Number(raw) });
      else out.push({ kind: "key", key: JSON.parse(raw) });
    }
  }
  return out;
}

export function accessExpr(lang: Language, base: string, path: string): string {
  if (!path || path === ".") return base;
  const segs = tokenize(path);
  if (lang === "javascript") {
    return segs.reduce((acc, s) => s.kind === "index" ? `${acc}[${s.index}]` : (isIdent(s.key) ? `${acc}.${s.key}` : `${acc}[${JSON.stringify(s.key)}]`), base);
  }
  if (lang === "python") {
    return segs.reduce((acc, s) => s.kind === "index" ? `${acc}[${s.index}]` : `${acc}[${JSON.stringify(s.key)}]`, base);
  }
  return segs.reduce((acc, s) => s.kind === "index" ? `${acc}[${s.index}]` : `${acc}[${JSON.stringify(s.key)}]`, base);
}

export function assignExpr(lang: Language, base: string, path: string, rhs: string): string {
  if (!path || path === ".") return `${base} = ${rhs}`;
  const target = accessExpr(lang, base, path);
  return `${target} = ${rhs}`;
}

function isIdent(s: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s);
}
