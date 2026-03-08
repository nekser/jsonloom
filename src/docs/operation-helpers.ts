import type { OperationType } from "@/src/operations";
import { operationCatalog } from "@/src/operations/operationRegistry";
import type { JSONValue } from "@/src/types/json";
import { operationDocs } from "./operations-content";

export type OperationHelperField = {
  label: string;
  value: string;
};

export type OperationHelperEntry = {
  excerpt: string;
  configFields: OperationHelperField[];
  outputExample: string;
  notes?: string;
};

const FALLBACK_EXCERPT = "No helper documentation is currently available for this operation.";
const FALLBACK_OUTPUT_EXAMPLE = "{}";
const FALLBACK_CONFIG_FIELDS: OperationHelperField[] = [{ label: "Settings", value: "No additional settings." }];

const keyLabels: Record<string, string> = {
  path: "Path",
  startPath: "Start path",
  endPath: "End path",
  compareTo: "Compare to",
  resultPath: "Result path",
  mode: "Mode",
  keys: "Keys",
  from: "From",
  to: "Target type",
  value: "Value",
  by: "By",
  op: "Operation",
  order: "Order",
  nulls: "Null handling",
  caseInsensitive: "Case-insensitive",
  depth: "Depth",
  start: "Start",
  end: "End",
  step: "Step",
  separator: "Separator",
  search: "Search",
  replace: "Replace",
  pattern: "Pattern",
  replacement: "Replacement",
  flags: "Flags",
  template: "Template",
  onMissing: "On missing",
  unit: "Unit",
  amount: "Amount",
  precision: "Precision",
  min: "Min",
  max: "Max",
  format: "Format",
  timezone: "Timezone",
  failOnError: "Fail on error",
  writeResultTo: "Write result to",
  source: "Source",
  schema: "Schema",
  when: "Condition",
  then: "Then steps",
  else: "Else steps",
  cases: "Cases",
  default: "Default steps",
  operations: "Nested steps",
};

function titleCaseKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (ch) => ch.toUpperCase());
}

function labelForKey(key: string): string {
  return keyLabels[key] ?? titleCaseKey(key);
}

function stringifyPrimitive(value: string | number | boolean | null): string {
  if (value === null) return "null";
  return String(value);
}

function summarizeObject(value: Record<string, JSONValue>): string {
  if ("path" in value && "op" in value && "value" in value) {
    const pathValue = stringifyPrimitive((value.path as string | number | boolean | null) ?? null);
    const opValue = stringifyPrimitive((value.op as string | number | boolean | null) ?? null);
    const compareValue = stringifyPrimitive((value.value as string | number | boolean | null) ?? null);
    return `${pathValue} ${opValue} ${compareValue}`;
  }
  if ("type" in value) {
    return `Type ${String(value.type)}`;
  }
  const count = Object.keys(value).length;
  return `${count} setting${count === 1 ? "" : "s"}`;
}

function formatFieldValue(key: string, value: JSONValue): string {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return stringifyPrimitive(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "None";

    if (key === "operations" || key === "then" || key === "else" || key === "default") {
      return `${value.length} step${value.length === 1 ? "" : "s"}`;
    }

    if (key === "cases") {
      return `${value.length} case${value.length === 1 ? "" : "s"}`;
    }

    const primitiveOnly = value.every((item) => item === null || typeof item === "string" || typeof item === "number" || typeof item === "boolean");
    if (primitiveOnly) return (value as Array<string | number | boolean | null>).map((item) => stringifyPrimitive(item)).join(", ");

    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }

  if (key === "schema") return "JSON Schema provided";

  return summarizeObject(value as Record<string, JSONValue>);
}

function parseConfigExample(configExample: string): Record<string, JSONValue> | null {
  try {
    const parsed = JSON.parse(configExample) as JSONValue;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, JSONValue>;
    }
  } catch {
    // Fallback handled by caller.
  }
  return null;
}

function fieldsFromConfigExample(configExample: string): OperationHelperField[] {
  const parsed = parseConfigExample(configExample);
  if (!parsed) return FALLBACK_CONFIG_FIELDS;

  const fields = Object.entries(parsed).map(([key, value]) => ({
    label: labelForKey(key),
    value: formatFieldValue(key, value),
  }));

  return fields.length > 0 ? fields : FALLBACK_CONFIG_FIELDS;
}

export const operationHelperByType: Record<OperationType, OperationHelperEntry> = Object.fromEntries(
  operationCatalog.map((meta) => {
    const docs = operationDocs[meta.type];
    const notes = docs?.notes?.trim();
    const helper: OperationHelperEntry = {
      excerpt: docs?.useCase?.trim() || meta.description || FALLBACK_EXCERPT,
      configFields: fieldsFromConfigExample(docs?.configExample?.trim() ?? ""),
      outputExample: docs?.outputExample?.trim() || FALLBACK_OUTPUT_EXAMPLE,
      ...(notes ? { notes } : {}),
    };
    return [meta.type, helper];
  })
) as Record<OperationType, OperationHelperEntry>;
