import { operationCatalog, operationMetaByType } from "@/src/operations/operationRegistry";
import type { OperationType } from "@/src/operations";
import type { JSONValue } from "@/src/types/json";
import { buildDemoLink } from "./demoLinks";
import type { OperationDocEntry } from "./types";

const baseInput = {
  users: [
    {
      id: 1,
      name: " Alice ",
      email: "alice@example.com",
      status: "active",
      score: 82,
      orders: [
        { id: "o-1", total: 120, createdAt: "2024-01-01T10:00:00Z", shippedAt: "2024-01-03T10:00:00Z" },
        { id: "o-2", total: 40, createdAt: "2024-01-05T09:00:00Z", shippedAt: "2024-01-06T09:30:00Z" },
      ],
      tags: ["vip", "newsletter", "vip"],
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      status: "inactive",
      score: 67,
      orders: [{ id: "o-3", total: 20, createdAt: "2024-02-01T12:00:00Z", shippedAt: "2024-02-01T14:00:00Z" }],
      tags: ["trial"],
    },
  ],
  metrics: { revenue: 160.5, vat: 0.24 },
  meta: { generatedAt: "2024-03-01T08:00:00Z", region: "eu" },
} as const;

function pretty(v: JSONValue): string {
  return JSON.stringify(v, null, 2);
}

function useCase(type: OperationType): string {
  const meta = operationMetaByType[type];
  return `${meta.description}. Example scenario: normalize incoming e-commerce payloads before API sync and analytics export.`;
}

function notes(type: OperationType): string {
  if (type === "MapArray" || type === "If" || type === "Switch") return "Supports nested pipelines; keep nested operations focused and short.";
  if (type === "ValidateJSON") return "ValidateJSON can fail fast; tune failOnError for strict vs permissive pipelines.";
  if (type === "TemplateInterpolate") return "Template placeholders support ${...}; missing values depend on onMissing mode.";
  if (type === "DateDiff" || type === "DateAdd" || type === "ParseDate" || type === "IsDateCompare") return "Date operations rely on parseable ISO strings and explicit units/timezones.";
  return "Can be combined with writeResultTo to route computed output without mutating original target path.";
}

function configFor(type: OperationType): JSONValue {
  const map: Record<OperationType, JSONValue> = {
    FilterByKey: { mode: "keep", keys: ["users", "meta"] },
    RenameKey: { from: "email", to: "primaryEmail" },
    MapArray: { path: "users", operations: [{ id: "nested-1", type: "TrimStrings", config: { path: "name" } }] },
    ExtractPath: { path: "users" },
    StringReplace: { path: "users[0].name", search: "Alice", replace: "Alicia" },
    RenameKeysByPattern: { pattern: "^id$", replacement: "userId", flags: "" },
    NormalizeKeyCase: { mode: "camel" },
    PickPaths: { paths: ["meta.generatedAt", "metrics.revenue"] },
    OmitPaths: { paths: ["users[1].tags"] },
    SetPath: { path: "meta.source", value: "import-batch" },
    DeletePath: { path: "users[1].orders" },
    MergeAtPath: { path: "meta", source: { environment: "prod" }, mode: "deep" },
    FlattenObject: { path: "meta" },
    UnflattenObject: { path: "meta" },
    FilterArray: { path: "users", key: "status", operator: "eq", value: "active", mode: "keep" },
    SortArray: { path: "users", by: "score", order: "desc", nulls: "last", caseInsensitive: false },
    UniqueArray: { path: "users[0].tags" },
    FlattenArray: { path: "users", depth: 1 },
    SliceArray: { path: "users", start: 0, end: 1, step: 1 },
    GroupBy: { path: "users", by: "status" },
    ReduceArray: { path: "users", by: "score", op: "avg" },
    CountArray: { path: "users" },
    JoinArray: { path: "users[0].tags", separator: ", " },
    RegexReplace: { path: "users[0].email", pattern: "@.*$", replace: "@masked.test", flags: "" },
    TrimStrings: { path: "users[0].name" },
    CoerceType: { path: "metrics.revenue", to: "string" },
    TemplateInterpolate: { path: "meta.summary", template: "${meta.region}:${metrics.revenue}", onMissing: "literal" },
    Base64: { path: "users[0].email", mode: "encode" },
    StringCase: { path: "users[0].status", mode: "uppercase", coerceNonString: false },
    Add: { path: "users[0].score", value: 5 },
    Subtract: { path: "users[0].score", value: 2 },
    Multiply: { path: "users[0].score", value: 2 },
    Divide: { path: "users[0].score", value: 2 },
    Modulo: { path: "users[0].score", value: 10 },
    Power: { path: "users[0].score", value: 2 },
    Round: { path: "metrics.revenue", precision: 0 },
    Clamp: { path: "users[0].score", min: 0, max: 100 },
    Sum: { path: "users[0].orders", by: "total" },
    Count: { path: "users[0].orders" },
    Min: { path: "users[0].orders", by: "total" },
    Max: { path: "users[0].orders", by: "total" },
    If: {
      when: { path: "meta.region", op: "eq", value: "eu" },
      then: [{ id: "then-1", type: "SetPath", config: { path: "meta.eu", value: true } }],
      else: [{ id: "else-1", type: "SetPath", config: { path: "meta.eu", value: false } }],
    },
    Switch: {
      path: "meta.region",
      cases: [{ value: "eu", ops: [{ id: "case-1", type: "SetPath", config: { path: "meta.currency", value: "EUR" } }] }],
      default: [{ id: "def-1", type: "SetPath", config: { path: "meta.currency", value: "USD" } }],
    },
    ValidateJSON: { path: "users", schema: { type: "array" }, failOnError: true },
    ParseDate: { path: "meta.generatedAt", format: "yyyy-LL-dd'T'HH:mm:ss'Z'", timezone: "utc" },
    IsDateCompare: { path: "meta.generatedAt", compareTo: "2024-01-01T00:00:00Z", op: "after", resultPath: "meta.isFresh" },
    DateAdd: { path: "meta.generatedAt", amount: 7, unit: "days" },
    DateDiff: { startPath: "users[0].orders[0].createdAt", endPath: "users[0].orders[0].shippedAt", unit: "days" },
  };
  return map[type];
}

function outputFor(type: OperationType): JSONValue {
  const map: Record<OperationType, JSONValue> = {
    FilterByKey: { users: baseInput.users, meta: baseInput.meta },
    RenameKey: { users: [{ primaryEmail: "alice@example.com" }], meta: baseInput.meta },
    MapArray: { users: [{ name: "Alice" }, { name: "Bob" }] },
    ExtractPath: baseInput.users as unknown as JSONValue,
    StringReplace: { users: [{ name: "Alicia" }] },
    RenameKeysByPattern: { users: [{ userId: 1 }] },
    NormalizeKeyCase: { generatedAt: "2024-03-01T08:00:00Z", region: "eu" },
    PickPaths: { meta: { generatedAt: "2024-03-01T08:00:00Z" }, metrics: { revenue: 160.5 } },
    OmitPaths: { users: [{ tags: ["vip"] }, {}] },
    SetPath: { meta: { source: "import-batch" } },
    DeletePath: { users: [{ id: 1 }, { id: 2 }] },
    MergeAtPath: { meta: { generatedAt: "2024-03-01T08:00:00Z", region: "eu", environment: "prod" } },
    FlattenObject: { "meta.generatedAt": "2024-03-01T08:00:00Z", "meta.region": "eu" },
    UnflattenObject: { meta: { generatedAt: "2024-03-01T08:00:00Z", region: "eu" } },
    FilterArray: [{ id: 1, status: "active" }],
    SortArray: [{ id: 1, score: 82 }, { id: 2, score: 67 }],
    UniqueArray: ["vip", "newsletter"],
    FlattenArray: [1, 2, 3],
    SliceArray: [{ id: 1, name: " Alice " }],
    GroupBy: { active: [{ id: 1 }], inactive: [{ id: 2 }] },
    ReduceArray: 74.5,
    CountArray: 2,
    JoinArray: "vip, newsletter",
    RegexReplace: "alice@masked.test",
    TrimStrings: "Alice",
    CoerceType: "160.5",
    TemplateInterpolate: "eu:160.5",
    Base64: "YWxpY2VAZXhhbXBsZS5jb20=",
    StringCase: "ACTIVE",
    Add: 87,
    Subtract: 80,
    Multiply: 164,
    Divide: 41,
    Modulo: 2,
    Power: 6724,
    Round: 161,
    Clamp: 82,
    Sum: 160,
    Count: 2,
    Min: 40,
    Max: 120,
    If: { meta: { eu: true } },
    Switch: { meta: { currency: "EUR" } },
    ValidateJSON: { valid: true },
    ParseDate: { meta: { generatedAt: "2024-03-01T08:00:00.000Z" } },
    IsDateCompare: { meta: { isFresh: true } },
    DateAdd: { meta: { generatedAt: "2024-03-08T08:00:00.000Z" } },
    DateDiff: { users: [{ orders: [{ shippedAt_diff_days: 2 }] }] },
  };
  return map[type];
}

export const operationDocs: Record<OperationType, OperationDocEntry> = Object.fromEntries(
  operationCatalog.map((meta) => {
    const type = meta.type;
    const config = configFor(type);
    const input = baseInput as unknown as JSONValue;
    const output = outputFor(type);
    const entry: OperationDocEntry = {
      type,
      useCase: useCase(type),
      inputExample: pretty(input),
      configExample: pretty(config),
      outputExample: pretty(output),
      notes: notes(type),
      demoLink: buildDemoLink(type, input, config),
    };
    return [type, entry];
  })
) as Record<OperationType, OperationDocEntry>;
