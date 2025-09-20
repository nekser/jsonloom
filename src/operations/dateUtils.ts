import { DateTime, DurationUnit } from "luxon";
import type { JSONValue } from "../types/json";

export type DateUnit = "days" | "hours" | "minutes" | "months" | "years";

export function parseDateString(value: JSONValue): DateTime | null {
  if (typeof value !== "string" || !value) return null;
  // Try ISO first
  const iso = DateTime.fromISO(value, { zone: "utc" });
  if (iso.isValid) return iso;
  // Fallbacks
  const rfc = DateTime.fromRFC2822(value, { zone: "utc" });
  if (rfc.isValid) return rfc;
  const sql = DateTime.fromSQL(value, { zone: "utc" });
  if (sql.isValid) return sql;
  return null;
}

export function parseWithFormat(value: JSONValue, format: string, timezone?: string): DateTime | null {
  if (typeof value !== "string" || !value) return null;
  const zone = timezone ?? "utc";

  if (!format) {
    const iso = DateTime.fromISO(value, { zone });
    if (iso.isValid) return iso;
    const rfc = DateTime.fromRFC2822(value, { zone });
    if (rfc.isValid) return rfc;
    const sql = DateTime.fromSQL(value, { zone });
    return sql.isValid ? sql : null;
  }

  const dt = DateTime.fromFormat(value, format, { zone });
  if (dt.isValid) return dt;

  const iso = DateTime.fromISO(value, { zone });
  if (iso.isValid) return iso;
  const rfc = DateTime.fromRFC2822(value, { zone });
  if (rfc.isValid) return rfc;
  const sql = DateTime.fromSQL(value, { zone });
  return sql.isValid ? sql : null;
}

export function toISO(dt: DateTime): string {
  const iso = dt.toUTC().toISO();
  return iso ?? dt.toUTC().toISO({ suppressMilliseconds: true }) ?? dt.toUTC().toISODate() ?? dt.toUTC().toISOTime() ?? dt.toMillis().toString();
}

export function addToDate(value: JSONValue, amount: number, unit: DateUnit): string | null {
  const base = parseDateString(value) ?? (typeof value === "string" ? DateTime.fromISO(value) : null);
  if (!base || !base.isValid) return null;
  const res = base.plus({ [unit]: amount });
  return toISO(res);
}

export function diffBetween(start: JSONValue, end: JSONValue, unit: DateUnit): number | null {
  const s = parseDateString(start);
  const e = parseDateString(end);
  if (!s || !e || !s.isValid || !e.isValid) return null;
  // Signed difference: end - start
  return e.diff(s, unit as DurationUnit).as(unit as DurationUnit);
}

export function compareDates(a: JSONValue, b: JSONValue, op: "after" | "afterOrEqual" | "before" | "beforeOrEqual"): boolean | null {
  const da = parseDateString(a);
  const db = parseDateString(b);
  if (!da || !db || !da.isValid || !db.isValid) return null;
  switch (op) {
    case "after":
      return da.toMillis() > db.toMillis();
    case "afterOrEqual":
      return da.toMillis() >= db.toMillis();
    case "before":
      return da.toMillis() < db.toMillis();
    case "beforeOrEqual":
      return da.toMillis() <= db.toMillis();
  }
}

export function siblingPathWithSuffix(path: string, suffix: string): string {
  if (!path) return suffix;
  const parts = path.split(".");
  const last = parts.pop() || "value";
  const nextLast = `${last}${suffix}`;
  return [...parts, nextLast].join(".");
}
