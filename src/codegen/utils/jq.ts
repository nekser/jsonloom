type Segment = { kind: "key"; key: string } | { kind: "index"; index: number };

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function tokenize(path: string): Segment[] {
  const out: Segment[] = [];
  const re = /([^.[\]]+)|(\[(?:\d+|"[^"\\]*"|'[^'\\]*')\])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path))) {
    if (m[1]) {
      out.push({ kind: "key", key: m[1] });
    } else if (m[2]) {
      const raw = m[2].slice(1, -1);
      if (/^\d+$/.test(raw)) out.push({ kind: "index", index: Number(raw) });
      else if (raw.startsWith("'") && raw.endsWith("'")) out.push({ kind: "key", key: raw.slice(1, -1).replace(/\\'/g, "'") });
      else out.push({ kind: "key", key: JSON.parse(raw) as string });
    }
  }
  return out;
}

export function toJqPathArray(path: string | undefined): string {
  const p = (path ?? "").trim();
  if (!p || p === ".") return "[]";
  const segs = tokenize(p).map((seg) => (seg.kind === "index" ? seg.index : seg.key));
  return JSON.stringify(segs);
}

export function toJqFilterPath(path: string | undefined, base = "."): string {
  const p = (path ?? "").trim();
  if (!p || p === ".") return base;
  const segs = tokenize(p);
  return segs.reduce((acc, seg) => {
    if (seg.kind === "index") return `${acc}[${seg.index}]`;
    if (IDENT_RE.test(seg.key)) return acc === "." ? `.${seg.key}` : `${acc}.${seg.key}`;
    return `${acc}[${JSON.stringify(seg.key)}]`;
  }, base);
}

export function jqLiteral(v: unknown): string {
  try {
    const out = JSON.stringify(v);
    return out === undefined ? "null" : out;
  } catch {
    return "null";
  }
}

export function jqTrimExpr(inputExpr = "."): string {
  return `${inputExpr} | gsub("^\\\\s+|\\\\s+$"; "")`;
}
