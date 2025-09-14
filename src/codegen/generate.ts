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
import P_Add from "./python/Add";
import P_Base64 from "./python/Base64";
import P_Clamp from "./python/Clamp";
import P_CoerceType from "./python/CoerceType";
import P_Count from "./python/Count";
import P_CountArray from "./python/CountArray";
import P_DateAdd from "./python/DateAdd";
import P_DateDiff from "./python/DateDiff";
import P_DeletePath from "./python/DeletePath";
import P_Divide from "./python/Divide";
import P_ExtractPath from "./python/ExtractPath";
import P_FilterArray from "./python/FilterArray";
import P_FilterByKey from "./python/FilterByKey";
import P_FlattenArray from "./python/FlattenArray";
import P_FlattenObject from "./python/FlattenObject";
import P_GroupBy from "./python/GroupBy";
import P_If from "./python/If";
import P_IsDateCompare from "./python/IsDateCompare";
import P_JoinArray from "./python/JoinArray";
import P_MapArray from "./python/MapArray";
import P_Max from "./python/Max";
import P_MergeAtPath from "./python/MergeAtPath";
import P_Min from "./python/Min";
import P_Modulo from "./python/Modulo";
import P_Multiply from "./python/Multiply";
import P_NormalizeKeyCase from "./python/NormalizeKeyCase";
import P_OmitPaths from "./python/OmitPaths";
import P_ParseDate from "./python/ParseDate";
import P_PickPaths from "./python/PickPaths";
import P_Power from "./python/Power";
import P_ReduceArray from "./python/ReduceArray";
import P_RegexReplace from "./python/RegexReplace";
import P_RenameKey from "./python/RenameKey";
import P_RenameKeysByPattern from "./python/RenameKeysByPattern";
import P_Round from "./python/Round";
import P_SetPath from "./python/SetPath";
import P_SetVariable from "./python/SetVariable";
import P_SliceArray from "./python/SliceArray";
import P_SortArray from "./python/SortArray";
import P_StringCase from "./python/StringCase";
import P_StringReplace from "./python/StringReplace";
import P_Subtract from "./python/Subtract";
import P_Sum from "./python/Sum";
import P_Switch from "./python/Switch";
import P_TemplateInterpolate from "./python/TemplateInterpolate";
import P_TrimStrings from "./python/TrimStrings";
import P_UnflattenObject from "./python/UnflattenObject";
import P_UniqueArray from "./python/UniqueArray";
import P_ValidateJSON from "./python/ValidateJSON";
// PHP
import PH_FilterArray from "./php/FilterArray";
import PH_Multiply from "./php/Multiply";
import PH_Add from "./php/Add";
import PH_Subtract from "./php/Subtract";
import PH_Divide from "./php/Divide";
import PH_MapArray from "./php/MapArray";
import PH_Modulo from "./php/Modulo";
import PH_Power from "./php/Power";
import PH_Round from "./php/Round";
import PH_Clamp from "./php/Clamp";
import PH_Sum from "./php/Sum";
import PH_Count from "./php/Count";
import PH_Min from "./php/Min";
import PH_Max from "./php/Max";
import PH_StringReplace from "./php/StringReplace";
import PH_SetPath from "./php/SetPath";
import PH_DeletePath from "./php/DeletePath";
import PH_ExtractPath from "./php/ExtractPath";
import PH_FilterByKey from "./php/FilterByKey";
import PH_RenameKey from "./php/RenameKey";
import PH_RegexReplace from "./php/RegexReplace";
import PH_TrimStrings from "./php/TrimStrings";
import PH_CoerceType from "./php/CoerceType";
import PH_Base64 from "./php/Base64";
import PH_StringCase from "./php/StringCase";
import PH_ParseDate from "./php/ParseDate";
import PH_DateAdd from "./php/DateAdd";
import PH_DateDiff from "./php/DateDiff";
import PH_IsDateCompare from "./php/IsDateCompare";
import PH_SortArray from "./php/SortArray";
import PH_UniqueArray from "./php/UniqueArray";
import PH_FlattenArray from "./php/FlattenArray";
import PH_SliceArray from "./php/SliceArray";
import PH_RenameKeysByPattern from "./php/RenameKeysByPattern";
import PH_PickPaths from "./php/PickPaths";
import PH_OmitPaths from "./php/OmitPaths";
import PH_CountArray from "./php/CountArray";
import PH_JoinArray from "./php/JoinArray";
import PH_FlattenObject from "./php/FlattenObject";
import PH_UnflattenObject from "./php/UnflattenObject";
import PH_MergeAtPath from "./php/MergeAtPath";
import PH_NormalizeKeyCase from "./php/NormalizeKeyCase";
import PH_GroupBy from "./php/GroupBy";
import PH_ReduceArray from "./php/ReduceArray";
import PH_TemplateInterpolate from "./php/TemplateInterpolate";
import PH_If from "./php/If";
import PH_Switch from "./php/Switch";
import PH_SetVariable from "./php/SetVariable";
import PH_ValidateJSON from "./php/ValidateJSON";

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
  // Collections
  FilterArray: P_FilterArray as unknown as TemplateFn,
  MapArray: P_MapArray as unknown as TemplateFn,
  SortArray: P_SortArray as unknown as TemplateFn,
  UniqueArray: P_UniqueArray as unknown as TemplateFn,
  FlattenArray: P_FlattenArray as unknown as TemplateFn,
  SliceArray: P_SliceArray as unknown as TemplateFn,
  GroupBy: P_GroupBy as unknown as TemplateFn,
  ReduceArray: P_ReduceArray as unknown as TemplateFn,
  CountArray: P_CountArray as unknown as TemplateFn,
  JoinArray: P_JoinArray as unknown as TemplateFn,

  // Strings & Regex
  StringReplace: P_StringReplace as unknown as TemplateFn,
  RegexReplace: P_RegexReplace as unknown as TemplateFn,
  TrimStrings: P_TrimStrings as unknown as TemplateFn,
  TemplateInterpolate: P_TemplateInterpolate as unknown as TemplateFn,
  StringCase: P_StringCase as unknown as TemplateFn,
  NormalizeKeyCase: P_NormalizeKeyCase as unknown as TemplateFn,

  // Paths & Objects
  ExtractPath: P_ExtractPath as unknown as TemplateFn,
  PickPaths: P_PickPaths as unknown as TemplateFn,
  OmitPaths: P_OmitPaths as unknown as TemplateFn,
  SetPath: P_SetPath as unknown as TemplateFn,
  DeletePath: P_DeletePath as unknown as TemplateFn,
  MergeAtPath: P_MergeAtPath as unknown as TemplateFn,
  FlattenObject: P_FlattenObject as unknown as TemplateFn,
  UnflattenObject: P_UnflattenObject as unknown as TemplateFn,
  FilterByKey: P_FilterByKey as unknown as TemplateFn,
  RenameKey: P_RenameKey as unknown as TemplateFn,
  RenameKeysByPattern: P_RenameKeysByPattern as unknown as TemplateFn,

  // Math & Numbers
  Multiply: P_Multiply as unknown as TemplateFn,
  Add: P_Add as unknown as TemplateFn,
  Subtract: P_Subtract as unknown as TemplateFn,
  Divide: P_Divide as unknown as TemplateFn,
  Modulo: P_Modulo as unknown as TemplateFn,
  Power: P_Power as unknown as TemplateFn,
  Round: P_Round as unknown as TemplateFn,
  Clamp: P_Clamp as unknown as TemplateFn,
  Sum: P_Sum as unknown as TemplateFn,
  Count: P_Count as unknown as TemplateFn,
  Min: P_Min as unknown as TemplateFn,
  Max: P_Max as unknown as TemplateFn,

  // Control Flow & Vars
  If: P_If as unknown as TemplateFn,
  Switch: P_Switch as unknown as TemplateFn,
  SetVariable: P_SetVariable as unknown as TemplateFn,

  // Types & Misc
  CoerceType: P_CoerceType as unknown as TemplateFn,
  Base64: P_Base64 as unknown as TemplateFn,
  ValidateJSON: P_ValidateJSON as unknown as TemplateFn,

  // Dates
  ParseDate: P_ParseDate as unknown as TemplateFn,
  IsDateCompare: P_IsDateCompare as unknown as TemplateFn,
  DateAdd: P_DateAdd as unknown as TemplateFn,
  DateDiff: P_DateDiff as unknown as TemplateFn,
  },
  php: {
    FilterArray: PH_FilterArray as unknown as TemplateFn,
  Multiply: PH_Multiply as unknown as TemplateFn,
  Add: PH_Add as unknown as TemplateFn,
  Subtract: PH_Subtract as unknown as TemplateFn,
  Divide: PH_Divide as unknown as TemplateFn,
  MapArray: PH_MapArray as unknown as TemplateFn,
  Modulo: PH_Modulo as unknown as TemplateFn,
  Power: PH_Power as unknown as TemplateFn,
  Round: PH_Round as unknown as TemplateFn,
  Clamp: PH_Clamp as unknown as TemplateFn,
  Sum: PH_Sum as unknown as TemplateFn,
  Count: PH_Count as unknown as TemplateFn,
  Min: PH_Min as unknown as TemplateFn,
  Max: PH_Max as unknown as TemplateFn,
  StringReplace: PH_StringReplace as unknown as TemplateFn,
  SetPath: PH_SetPath as unknown as TemplateFn,
  DeletePath: PH_DeletePath as unknown as TemplateFn,
  ExtractPath: PH_ExtractPath as unknown as TemplateFn,
  FilterByKey: PH_FilterByKey as unknown as TemplateFn,
  RenameKey: PH_RenameKey as unknown as TemplateFn,
  RegexReplace: PH_RegexReplace as unknown as TemplateFn,
  TrimStrings: PH_TrimStrings as unknown as TemplateFn,
  CoerceType: PH_CoerceType as unknown as TemplateFn,
  Base64: PH_Base64 as unknown as TemplateFn,
  StringCase: PH_StringCase as unknown as TemplateFn,
  ParseDate: PH_ParseDate as unknown as TemplateFn,
  DateAdd: PH_DateAdd as unknown as TemplateFn,
  DateDiff: PH_DateDiff as unknown as TemplateFn,
  IsDateCompare: PH_IsDateCompare as unknown as TemplateFn,
  SortArray: PH_SortArray as unknown as TemplateFn,
  UniqueArray: PH_UniqueArray as unknown as TemplateFn,
  FlattenArray: PH_FlattenArray as unknown as TemplateFn,
  SliceArray: PH_SliceArray as unknown as TemplateFn,
  RenameKeysByPattern: PH_RenameKeysByPattern as unknown as TemplateFn,
  PickPaths: PH_PickPaths as unknown as TemplateFn,
  OmitPaths: PH_OmitPaths as unknown as TemplateFn,
  CountArray: PH_CountArray as unknown as TemplateFn,
  JoinArray: PH_JoinArray as unknown as TemplateFn,
  FlattenObject: PH_FlattenObject as unknown as TemplateFn,
  UnflattenObject: PH_UnflattenObject as unknown as TemplateFn,
  MergeAtPath: PH_MergeAtPath as unknown as TemplateFn,
  NormalizeKeyCase: PH_NormalizeKeyCase as unknown as TemplateFn,
  GroupBy: PH_GroupBy as unknown as TemplateFn,
  ReduceArray: PH_ReduceArray as unknown as TemplateFn,
  TemplateInterpolate: PH_TemplateInterpolate as unknown as TemplateFn,
  If: PH_If as unknown as TemplateFn,
  Switch: PH_Switch as unknown as TemplateFn,
  SetVariable: PH_SetVariable as unknown as TemplateFn,
  ValidateJSON: PH_ValidateJSON as unknown as TemplateFn,
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

export function generatePipeline(lang: Lang, ops: Operation[], rootVar = "data", source?: unknown): string {
  // Inject nested dispatcher for templates like MapArray
  // @ts-expect-error attach global for runtime
  globalThis.__codegen_generateOp = (l: Lang, op: Operation, v: string) => generateOperation(l, op, v);
  const lines: string[] = [];
  // Header with source JSON as string + parse when provided
  if (source !== undefined) {
    let jsonText = "";
    try { jsonText = JSON.stringify(source, null, 2) ?? ""; } catch { jsonText = ""; }
    // JavaScript: use template literal (HEREDOC analogue). Escape backticks and `${` to prevent interpolation.
    if (lang === "javascript") {
      const jsSafe = jsonText
        .replace(/`/g, "\\`")
        .replace(/\$\{/g, "${'${'}");
      lines.push(`// Generated by JSON Tool UI\nconst jsonString = \`\n${jsSafe}\n\`;\nlet ${rootVar} = JSON.parse(jsonString);`);
    }
    // Python: use triple-quoted string (HEREDOC analogue)
    if (lang === "python") {
      lines.push(`# Generated by JSON Tool UI\nimport json\njson_string = '''\n${jsonText}\n'''\n${rootVar} = json.loads(json_string)`);
    }
    if (lang === "php") {
      // Use NOWDOC (HEREDOC-style) to embed JSON without escaping
      lines.push(`// Generated by JSON Tool UI\n$json_string = <<<'JSON_PAYLOAD'\n${jsonText}\nJSON_PAYLOAD;\n$${rootVar} = json_decode($json_string, true);`);
    }
  } else {
    // Fallback to previous behavior if no source provided
    if (lang === "javascript") lines.push(`// Generated by JSON Tool UI\nlet ${rootVar} = ${rootVar};`);
    if (lang === "python") lines.push(`# Generated by JSON Tool UI\n${rootVar} = ${rootVar}`);
    if (lang === "php") lines.push("// Generated by JSON Tool UI\n$" + rootVar + " = $" + rootVar + ";");
  }
  for (const op of ops) lines.push(generateOperation(lang, op, rootVar));
  return lines.join("\n\n");
}

function safeJson(v: unknown): string {
  try { return JSON.stringify(v); } catch { return '"<unserializable>"'; }
}
