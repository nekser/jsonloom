import type { Operation } from "../operations/types";
// JS
import J_FilterArray from "./javascript/FilterArray";
import J_MapArray from "./javascript/MapArray";
import J_Multiply from "./javascript/Multiply";
import J_Add from "./javascript/Add";
import J_Subtract from "./javascript/Subtract";
import J_Divide from "./javascript/Divide";
import J_FilterByKey from "./javascript/FilterByKey";
import J_RenameKey from "./javascript/RenameKey";
import J_ExtractPath from "./javascript/ExtractPath";
import J_StringReplace from "./javascript/StringReplace";
import J_RenameKeysByPattern from "./javascript/RenameKeysByPattern";
import J_NormalizeKeyCase from "./javascript/NormalizeKeyCase";
import J_PickPaths from "./javascript/PickPaths";
import J_OmitPaths from "./javascript/OmitPaths";
import J_SetPath from "./javascript/SetPath";
import J_DeletePath from "./javascript/DeletePath";
import J_MergeAtPath from "./javascript/MergeAtPath";
import J_FlattenObject from "./javascript/FlattenObject";
import J_UnflattenObject from "./javascript/UnflattenObject";
import J_SortArray from "./javascript/SortArray";
import J_UniqueArray from "./javascript/UniqueArray";
import J_FlattenArray from "./javascript/FlattenArray";
import J_SliceArray from "./javascript/SliceArray";
import J_GroupBy from "./javascript/GroupBy";
import J_ReduceArray from "./javascript/ReduceArray";
import J_CountArray from "./javascript/CountArray";
import J_JoinArray from "./javascript/JoinArray";
import J_RegexReplace from "./javascript/RegexReplace";
import J_TrimStrings from "./javascript/TrimStrings";
import J_CoerceType from "./javascript/CoerceType";
import J_TemplateInterpolate from "./javascript/TemplateInterpolate";
import J_Base64 from "./javascript/Base64";
import J_StringCase from "./javascript/StringCase";
import J_If from "./javascript/If";
import J_Switch from "./javascript/Switch";
import J_SetVariable from "./javascript/SetVariable";
import J_Modulo from "./javascript/Modulo";
import J_Power from "./javascript/Power";
import J_Round from "./javascript/Round";
import J_Clamp from "./javascript/Clamp";
import J_Sum from "./javascript/Sum";
import J_Count from "./javascript/Count";
import J_Min from "./javascript/Min";
import J_Max from "./javascript/Max";
import J_ValidateJSON from "./javascript/ValidateJSON";
import J_ParseDate from "./javascript/ParseDate";
import J_IsDateCompare from "./javascript/IsDateCompare";
import J_DateAdd from "./javascript/DateAdd";
import J_DateDiff from "./javascript/DateDiff";
// Python
import P_FilterArray from "./python/FilterArray";
import P_Multiply from "./python/Multiply";
import P_Add from "./python/Add";
import P_Subtract from "./python/Subtract";
import P_Divide from "./python/Divide";
// PHP
import PH_FilterArray from "./php/FilterArray";
import PH_Multiply from "./php/Multiply";
import PH_Add from "./php/Add";
import PH_Subtract from "./php/Subtract";
import PH_Divide from "./php/Divide";

export type Lang = "javascript" | "python" | "php";

type TemplateFn = (config: unknown, varName: string) => string;

const JS_TODO: TemplateFn = (cfg) => `// TODO: not implemented\n// config: ${safeJson(cfg)}`;
const PY_TODO: TemplateFn = (cfg) => `# TODO: not implemented\n# config: ${safeJson(cfg)}`;
const PHP_TODO: TemplateFn = (cfg) => `// TODO: not implemented\n// config: ${safeJson(cfg)}`;

const registry: Record<Lang, Record<string, TemplateFn>> = {
  javascript: {
  FilterArray: J_FilterArray as unknown as TemplateFn,
  MapArray: J_MapArray as unknown as TemplateFn,
  Multiply: J_Multiply as unknown as TemplateFn,
  Add: J_Add as unknown as TemplateFn,
  Subtract: J_Subtract as unknown as TemplateFn,
  Divide: J_Divide as unknown as TemplateFn,
  FilterByKey: J_FilterByKey as unknown as TemplateFn,
  RenameKey: J_RenameKey as unknown as TemplateFn,
  ExtractPath: J_ExtractPath as unknown as TemplateFn,
  StringReplace: J_StringReplace as unknown as TemplateFn,
  RenameKeysByPattern: J_RenameKeysByPattern as unknown as TemplateFn,
  NormalizeKeyCase: J_NormalizeKeyCase as unknown as TemplateFn,
  PickPaths: J_PickPaths as unknown as TemplateFn,
  OmitPaths: J_OmitPaths as unknown as TemplateFn,
  SetPath: J_SetPath as unknown as TemplateFn,
  DeletePath: J_DeletePath as unknown as TemplateFn,
  MergeAtPath: J_MergeAtPath as unknown as TemplateFn,
  FlattenObject: J_FlattenObject as unknown as TemplateFn,
  UnflattenObject: J_UnflattenObject as unknown as TemplateFn,
  SortArray: J_SortArray as unknown as TemplateFn,
  UniqueArray: J_UniqueArray as unknown as TemplateFn,
  FlattenArray: J_FlattenArray as unknown as TemplateFn,
  SliceArray: J_SliceArray as unknown as TemplateFn,
  GroupBy: J_GroupBy as unknown as TemplateFn,
  ReduceArray: J_ReduceArray as unknown as TemplateFn,
  CountArray: J_CountArray as unknown as TemplateFn,
  JoinArray: J_JoinArray as unknown as TemplateFn,
  RegexReplace: J_RegexReplace as unknown as TemplateFn,
  TrimStrings: J_TrimStrings as unknown as TemplateFn,
  CoerceType: J_CoerceType as unknown as TemplateFn,
  TemplateInterpolate: J_TemplateInterpolate as unknown as TemplateFn,
  Base64: J_Base64 as unknown as TemplateFn,
  StringCase: J_StringCase as unknown as TemplateFn,
  If: J_If as unknown as TemplateFn,
  Switch: J_Switch as unknown as TemplateFn,
  SetVariable: J_SetVariable as unknown as TemplateFn,
  Modulo: J_Modulo as unknown as TemplateFn,
  Power: J_Power as unknown as TemplateFn,
  Round: J_Round as unknown as TemplateFn,
  Clamp: J_Clamp as unknown as TemplateFn,
  Sum: J_Sum as unknown as TemplateFn,
  Count: J_Count as unknown as TemplateFn,
  Min: J_Min as unknown as TemplateFn,
  Max: J_Max as unknown as TemplateFn,
  ValidateJSON: J_ValidateJSON as unknown as TemplateFn,
  ParseDate: J_ParseDate as unknown as TemplateFn,
  IsDateCompare: J_IsDateCompare as unknown as TemplateFn,
  DateAdd: J_DateAdd as unknown as TemplateFn,
  DateDiff: J_DateDiff as unknown as TemplateFn,
  },
  python: {
    FilterArray: P_FilterArray as unknown as TemplateFn,
  Multiply: P_Multiply as unknown as TemplateFn,
  Add: P_Add as unknown as TemplateFn,
  Subtract: P_Subtract as unknown as TemplateFn,
  Divide: P_Divide as unknown as TemplateFn,
  },
  php: {
    FilterArray: PH_FilterArray as unknown as TemplateFn,
  Multiply: PH_Multiply as unknown as TemplateFn,
  Add: PH_Add as unknown as TemplateFn,
  Subtract: PH_Subtract as unknown as TemplateFn,
  Divide: PH_Divide as unknown as TemplateFn,
  },
};

const ALL_TYPES = [
  "FilterByKey","RenameKey","MapArray","ExtractPath","StringReplace",
  "RenameKeysByPattern","NormalizeKeyCase","PickPaths","OmitPaths","SetPath","DeletePath","MergeAtPath","FlattenObject","UnflattenObject",
  "FilterArray","SortArray","UniqueArray","FlattenArray","SliceArray","GroupBy","ReduceArray","CountArray","JoinArray",
  "RegexReplace","TrimStrings","CoerceType","TemplateInterpolate","Base64","StringCase",
  "Add","Subtract","Multiply","Divide","Modulo","Power","Round","Clamp","Sum","Count","Min","Max",
  "If","Switch","SetVariable","ValidateJSON","ParseDate","IsDateCompare","DateAdd","DateDiff"
];

for (const t of ALL_TYPES) {
  if (!registry.javascript[t]) registry.javascript[t] = JS_TODO;
  if (!registry.python[t]) registry.python[t] = PY_TODO;
  if (!registry.php[t]) registry.php[t] = PHP_TODO;
}

export function generateOperation(lang: Lang, op: Operation, varName: string): string {
  // Normalize legacy dotted names like "Math.Multiply" -> "Multiply"
  const type = op.type.split(".").pop() as string;
  const t = registry[lang][type];
  if (!t) return `# TODO: ${op.type} not supported yet`;
  return t(op.config, varName);
}

export function generatePipeline(lang: Lang, ops: Operation[], rootVar = "data"): string {
  // Inject nested dispatcher for templates like MapArray
  // @ts-expect-error attach global for runtime
  globalThis.__codegen_generateOp = (l: Lang, op: Operation, v: string) => generateOperation(l, op, v);
  const lines: string[] = [];
  if (lang === "javascript") lines.push(`// Generated by JSON Tool UI\nlet ${rootVar} = ${rootVar};`);
  if (lang === "python") lines.push(`# Generated by JSON Tool UI\n${rootVar} = ${rootVar}`);
  if (lang === "php") lines.push("// Generated by JSON Tool UI\n$" + rootVar + " = $" + rootVar + ";");
  for (const op of ops) lines.push(generateOperation(lang, op, rootVar));
  return lines.join("\n\n");
}

function safeJson(v: unknown): string {
  try { return JSON.stringify(v); } catch { return '"<unserializable>"'; }
}
