export function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

export function isDocsAndCodegenEnabled(value = process.env.NEXT_PUBLIC_ENABLE_DOCS_AND_CODEGEN): boolean {
  return parseBooleanFlag(value);
}

export const DOCS_AND_CODEGEN_ENABLED = isDocsAndCodegenEnabled();
