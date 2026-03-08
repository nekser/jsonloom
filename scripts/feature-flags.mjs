export function parseBooleanFlag(value) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

export function isDocsAndCodegenEnabled(value = process.env.NEXT_PUBLIC_ENABLE_DOCS_AND_CODEGEN) {
  return parseBooleanFlag(value);
}
