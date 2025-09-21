import type { Operation } from "../operations/types";
import { indent } from "./utils/helpers";
import { accessExpr, assignExpr } from "./utils/pathResolution";
// JS
import J_Add from "./javascript/Add";
import J_Base64 from "./javascript/Base64";
import J_Clamp from "./javascript/Clamp";
import J_CoerceType from "./javascript/CoerceType";
import J_Count from "./javascript/Count";
import J_CountArray from "./javascript/CountArray";
import J_DateAdd from "./javascript/DateAdd";
import J_DateDiff from "./javascript/DateDiff";
import J_DeletePath from "./javascript/DeletePath";
import J_Divide from "./javascript/Divide";
import J_ExtractPath from "./javascript/ExtractPath";
import J_FilterArray from "./javascript/FilterArray";
import J_FilterByKey from "./javascript/FilterByKey";
import J_FlattenArray from "./javascript/FlattenArray";
import J_FlattenObject from "./javascript/FlattenObject";
import J_GroupBy from "./javascript/GroupBy";
import J_If from "./javascript/If";
import J_IsDateCompare from "./javascript/IsDateCompare";
import J_JoinArray from "./javascript/JoinArray";
import J_MapArray from "./javascript/MapArray";
import J_Max from "./javascript/Max";
import J_MergeAtPath from "./javascript/MergeAtPath";
import J_Min from "./javascript/Min";
import J_Modulo from "./javascript/Modulo";
import J_Multiply from "./javascript/Multiply";
import J_NormalizeKeyCase from "./javascript/NormalizeKeyCase";
import J_OmitPaths from "./javascript/OmitPaths";
import J_ParseDate from "./javascript/ParseDate";
import J_PickPaths from "./javascript/PickPaths";
import J_Power from "./javascript/Power";
import J_ReduceArray from "./javascript/ReduceArray";
import J_RegexReplace from "./javascript/RegexReplace";
import J_RenameKey from "./javascript/RenameKey";
import J_RenameKeysByPattern from "./javascript/RenameKeysByPattern";
import J_Round from "./javascript/Round";
import J_SetPath from "./javascript/SetPath";
import J_SliceArray from "./javascript/SliceArray";
import J_SortArray from "./javascript/SortArray";
import J_StringCase from "./javascript/StringCase";
import J_StringReplace from "./javascript/StringReplace";
import J_Subtract from "./javascript/Subtract";
import J_Sum from "./javascript/Sum";
import J_Switch from "./javascript/Switch";
import J_TemplateInterpolate from "./javascript/TemplateInterpolate";
import J_TrimStrings from "./javascript/TrimStrings";
import J_UnflattenObject from "./javascript/UnflattenObject";
import J_UniqueArray from "./javascript/UniqueArray";
import J_ValidateJSON from "./javascript/ValidateJSON";
// TypeScript (mirrors JS)
import T_Add from "./typescript/Add";
import T_Base64 from "./typescript/Base64";
import T_Clamp from "./typescript/Clamp";
import T_CoerceType from "./typescript/CoerceType";
import T_Count from "./typescript/Count";
import T_CountArray from "./typescript/CountArray";
import T_DateAdd from "./typescript/DateAdd";
import T_DateDiff from "./typescript/DateDiff";
import T_DeletePath from "./typescript/DeletePath";
import T_Divide from "./typescript/Divide";
import T_ExtractPath from "./typescript/ExtractPath";
import T_FilterArray from "./typescript/FilterArray";
import T_FilterByKey from "./typescript/FilterByKey";
import T_FlattenArray from "./typescript/FlattenArray";
import T_FlattenObject from "./typescript/FlattenObject";
import T_GroupBy from "./typescript/GroupBy";
import T_If from "./typescript/If";
import T_IsDateCompare from "./typescript/IsDateCompare";
import T_JoinArray from "./typescript/JoinArray";
import T_MapArray from "./typescript/MapArray";
import T_Max from "./typescript/Max";
import T_MergeAtPath from "./typescript/MergeAtPath";
import T_Min from "./typescript/Min";
import T_Modulo from "./typescript/Modulo";
import T_Multiply from "./typescript/Multiply";
import T_NormalizeKeyCase from "./typescript/NormalizeKeyCase";
import T_OmitPaths from "./typescript/OmitPaths";
import T_ParseDate from "./typescript/ParseDate";
import T_PickPaths from "./typescript/PickPaths";
import T_Power from "./typescript/Power";
import T_ReduceArray from "./typescript/ReduceArray";
import T_RegexReplace from "./typescript/RegexReplace";
import T_RenameKey from "./typescript/RenameKey";
import T_RenameKeysByPattern from "./typescript/RenameKeysByPattern";
import T_Round from "./typescript/Round";
import T_SetPath from "./typescript/SetPath";
import T_SliceArray from "./typescript/SliceArray";
import T_SortArray from "./typescript/SortArray";
import T_StringCase from "./typescript/StringCase";
import T_StringReplace from "./typescript/StringReplace";
import T_Subtract from "./typescript/Subtract";
import T_Sum from "./typescript/Sum";
import T_Switch from "./typescript/Switch";
import T_TemplateInterpolate from "./typescript/TemplateInterpolate";
import T_TrimStrings from "./typescript/TrimStrings";
import T_UnflattenObject from "./typescript/UnflattenObject";
import T_UniqueArray from "./typescript/UniqueArray";
import T_ValidateJSON from "./typescript/ValidateJSON";
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
import PH_Add from "./php/Add";
import PH_Base64 from "./php/Base64";
import PH_Clamp from "./php/Clamp";
import PH_CoerceType from "./php/CoerceType";
import PH_Count from "./php/Count";
import PH_CountArray from "./php/CountArray";
import PH_DateAdd from "./php/DateAdd";
import PH_DateDiff from "./php/DateDiff";
import PH_DeletePath from "./php/DeletePath";
import PH_Divide from "./php/Divide";
import PH_ExtractPath from "./php/ExtractPath";
import PH_FilterArray from "./php/FilterArray";
import PH_FilterByKey from "./php/FilterByKey";
import PH_FlattenArray from "./php/FlattenArray";
import PH_FlattenObject from "./php/FlattenObject";
import PH_GroupBy from "./php/GroupBy";
import PH_If from "./php/If";
import PH_IsDateCompare from "./php/IsDateCompare";
import PH_JoinArray from "./php/JoinArray";
import PH_MapArray from "./php/MapArray";
import PH_Max from "./php/Max";
import PH_MergeAtPath from "./php/MergeAtPath";
import PH_Min from "./php/Min";
import PH_Modulo from "./php/Modulo";
import PH_Multiply from "./php/Multiply";
import PH_NormalizeKeyCase from "./php/NormalizeKeyCase";
import PH_OmitPaths from "./php/OmitPaths";
import PH_ParseDate from "./php/ParseDate";
import PH_PickPaths from "./php/PickPaths";
import PH_Power from "./php/Power";
import PH_ReduceArray from "./php/ReduceArray";
import PH_RegexReplace from "./php/RegexReplace";
import PH_RenameKey from "./php/RenameKey";
import PH_RenameKeysByPattern from "./php/RenameKeysByPattern";
import PH_Round from "./php/Round";
import PH_SetPath from "./php/SetPath";
import PH_SliceArray from "./php/SliceArray";
import PH_SortArray from "./php/SortArray";
import PH_StringCase from "./php/StringCase";
import PH_StringReplace from "./php/StringReplace";
import PH_Subtract from "./php/Subtract";
import PH_Sum from "./php/Sum";
import PH_Switch from "./php/Switch";
import PH_TemplateInterpolate from "./php/TemplateInterpolate";
import PH_TrimStrings from "./php/TrimStrings";
import PH_UnflattenObject from "./php/UnflattenObject";
import PH_UniqueArray from "./php/UniqueArray";
import PH_ValidateJSON from "./php/ValidateJSON";
// Go
import GO_Add from "./go/Add";
import GO_Clamp from "./go/Clamp";
import GO_CountArray from "./go/CountArray";
import GO_DeletePath from "./go/DeletePath";
import GO_Divide from "./go/Divide";
import GO_ExtractPath from "./go/ExtractPath";
import GO_FilterArray from "./go/FilterArray";
import GO_JoinArray from "./go/JoinArray";
import GO_MapArray from "./go/MapArray";
import GO_Max from "./go/Max";
import GO_Min from "./go/Min";
import GO_Modulo from "./go/Modulo";
import GO_Multiply from "./go/Multiply";
import GO_Power from "./go/Power";
import GO_Round from "./go/Round";
import GO_SetPath from "./go/SetPath";
import GO_StringReplace from "./go/StringReplace";
import GO_Subtract from "./go/Subtract";
import GO_Sum from "./go/Sum";
import goHeader from "./go/_header";

export type Lang = "javascript" | "typescript" | "python" | "php" | "go";

type TemplateFn = (config: unknown, varName: string) => string;

const JS_TODO: TemplateFn = (cfg) => `// TODO: not implemented\n// config: ${safeJson(cfg)}`;
const TS_TODO: TemplateFn = (cfg) => `// TODO: not implemented\n// config: ${safeJson(cfg)}`;
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
  typescript: {
  FilterArray: T_FilterArray as unknown as TemplateFn,
  MapArray: T_MapArray as unknown as TemplateFn,
  Multiply: T_Multiply as unknown as TemplateFn,
  Add: T_Add as unknown as TemplateFn,
  Subtract: T_Subtract as unknown as TemplateFn,
  Divide: T_Divide as unknown as TemplateFn,
  FilterByKey: T_FilterByKey as unknown as TemplateFn,
  RenameKey: T_RenameKey as unknown as TemplateFn,
  ExtractPath: T_ExtractPath as unknown as TemplateFn,
  StringReplace: T_StringReplace as unknown as TemplateFn,
  RenameKeysByPattern: T_RenameKeysByPattern as unknown as TemplateFn,
  NormalizeKeyCase: T_NormalizeKeyCase as unknown as TemplateFn,
  PickPaths: T_PickPaths as unknown as TemplateFn,
  OmitPaths: T_OmitPaths as unknown as TemplateFn,
  SetPath: T_SetPath as unknown as TemplateFn,
  DeletePath: T_DeletePath as unknown as TemplateFn,
  MergeAtPath: T_MergeAtPath as unknown as TemplateFn,
  FlattenObject: T_FlattenObject as unknown as TemplateFn,
  UnflattenObject: T_UnflattenObject as unknown as TemplateFn,
  SortArray: T_SortArray as unknown as TemplateFn,
  UniqueArray: T_UniqueArray as unknown as TemplateFn,
  FlattenArray: T_FlattenArray as unknown as TemplateFn,
  SliceArray: T_SliceArray as unknown as TemplateFn,
  GroupBy: T_GroupBy as unknown as TemplateFn,
  ReduceArray: T_ReduceArray as unknown as TemplateFn,
  CountArray: T_CountArray as unknown as TemplateFn,
  JoinArray: T_JoinArray as unknown as TemplateFn,
  RegexReplace: T_RegexReplace as unknown as TemplateFn,
  TrimStrings: T_TrimStrings as unknown as TemplateFn,
  CoerceType: T_CoerceType as unknown as TemplateFn,
  TemplateInterpolate: T_TemplateInterpolate as unknown as TemplateFn,
  Base64: T_Base64 as unknown as TemplateFn,
  StringCase: T_StringCase as unknown as TemplateFn,
  If: T_If as unknown as TemplateFn,
  Switch: T_Switch as unknown as TemplateFn,
  Modulo: T_Modulo as unknown as TemplateFn,
  Power: T_Power as unknown as TemplateFn,
  Round: T_Round as unknown as TemplateFn,
  Clamp: T_Clamp as unknown as TemplateFn,
  Sum: T_Sum as unknown as TemplateFn,
  Count: T_Count as unknown as TemplateFn,
  Min: T_Min as unknown as TemplateFn,
  Max: T_Max as unknown as TemplateFn,
  ValidateJSON: T_ValidateJSON as unknown as TemplateFn,
  ParseDate: T_ParseDate as unknown as TemplateFn,
  IsDateCompare: T_IsDateCompare as unknown as TemplateFn,
  DateAdd: T_DateAdd as unknown as TemplateFn,
  DateDiff: T_DateDiff as unknown as TemplateFn,
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
  ValidateJSON: PH_ValidateJSON as unknown as TemplateFn,
  },
  go: {
    // Collections
    FilterArray: GO_FilterArray as unknown as TemplateFn,
    MapArray: GO_MapArray as unknown as TemplateFn,
    CountArray: GO_CountArray as unknown as TemplateFn,
    JoinArray: GO_JoinArray as unknown as TemplateFn,

    // Math & Numbers
    Add: GO_Add as unknown as TemplateFn,
    Subtract: GO_Subtract as unknown as TemplateFn,
    Multiply: GO_Multiply as unknown as TemplateFn,
    Divide: GO_Divide as unknown as TemplateFn,
    Modulo: GO_Modulo as unknown as TemplateFn,
    Power: GO_Power as unknown as TemplateFn,
    Round: GO_Round as unknown as TemplateFn,
    Clamp: GO_Clamp as unknown as TemplateFn,
    Sum: GO_Sum as unknown as TemplateFn,
    Min: GO_Min as unknown as TemplateFn,
    Max: GO_Max as unknown as TemplateFn,

    // Paths & Objects
    SetPath: GO_SetPath as unknown as TemplateFn,
    DeletePath: GO_DeletePath as unknown as TemplateFn,
    ExtractPath: GO_ExtractPath as unknown as TemplateFn,

    // Strings
    StringReplace: GO_StringReplace as unknown as TemplateFn,
  },
};

const ALL_TYPES = [
  "FilterByKey","RenameKey","MapArray","ExtractPath","StringReplace",
  "RenameKeysByPattern","NormalizeKeyCase","PickPaths","OmitPaths","SetPath","DeletePath","MergeAtPath","FlattenObject","UnflattenObject",
  "FilterArray","SortArray","UniqueArray","FlattenArray","SliceArray","GroupBy","ReduceArray","CountArray","JoinArray",
  "RegexReplace","TrimStrings","CoerceType","TemplateInterpolate","Base64","StringCase",
  "Add","Subtract","Multiply","Divide","Modulo","Power","Round","Clamp","Sum","Count","Min","Max",
  "If","Switch","ValidateJSON","ParseDate","IsDateCompare","DateAdd","DateDiff"
];

for (const t of ALL_TYPES) {
  if (!registry.javascript[t]) registry.javascript[t] = JS_TODO;
  if (!registry.typescript[t]) registry.typescript[t] = TS_TODO;
  if (!registry.python[t]) registry.python[t] = PY_TODO;
  if (!registry.php[t]) registry.php[t] = PHP_TODO;
  if (!registry.go[t]) registry.go[t] = JS_TODO;
}

export function generateOperation(lang: Lang, op: Operation, varName: string): string {
  // Normalize legacy dotted names like "Math.Multiply" -> "Multiply"
  const type = op.type.split(".").pop() as string;
  const t = registry[lang][type];
  if (!t) return `# TODO: ${op.type} not supported yet`;
  const body = t(op.config, varName);

  // Unified result routing (writeResultTo): if present, write the meaningful value to the target path.
  // Heuristic:
  // - If config has a string `path` and the op is not ExtractPath, we treat the meaningful value as the value at that path after mutation.
  // - Otherwise, we treat the meaningful value as the current root variable.
  try {
    const cfg = (op.config ?? {}) as Record<string, unknown>;
    const writeTo = typeof cfg.writeResultTo === "string" ? cfg.writeResultTo.trim() : "";
    if (writeTo) {
      const hasPath = typeof cfg.path === "string" && (cfg.path as string).trim().length > 0;
      const isExtract = type === "ExtractPath";
      const sourceExpr = hasPath && !isExtract
        ? accessExpr(lang as Lang, varName, (cfg.path as string))
        : varName;
  const rootAlias = lang === "php" ? "__root" : "__root"; // same name across langs; PHP variables have $ added by assignExpr
  let line = assignExpr(lang as Lang, rootAlias, writeTo, sourceExpr);
      if (lang === "php") line += ";";
      return body ? `${body}\n${line}` : line;
    }
  } catch {
    // best-effort only; ignore routing if config shape is unexpected
  }
  return body;
}

export function generatePipeline(lang: Lang, ops: Operation[], rootVar = "data", source?: unknown): string {
  // Inject nested dispatcher for templates like MapArray
  // @ts-expect-error attach global for runtime
  globalThis.__codegen_generateOp = (l: Lang, op: Operation, v: string) => generateOperation(l, op, v);
  const lines: string[] = [];
  // Special case: Go emits a full program with helpers
  if (lang === "go") {
    const parts: string[] = [];
    parts.push(goHeader(rootVar, source));
    parts.push("func main() {");
    parts.push(`  var ${rootVar} any`);
    parts.push("  var __root any");
    if (source !== undefined) {
      let jsonText = "";
      try { jsonText = JSON.stringify(source, null, 2) ?? ""; } catch { jsonText = ""; }
      const goSafe = jsonText.replace(/`/g, "\\`");
      parts.push("  // Parse embedded JSON source");
      parts.push("  jsonString := `\n" + goSafe + "\n`");
      parts.push("  _ = json.Unmarshal([]byte(jsonString), &" + rootVar + ")");
    } else {
      parts.push(`  ${rootVar} = map[string]any{}`);
    }
    parts.push(`  __root = ${rootVar}`);
    for (const op of ops) parts.push(indent(generateOperation(lang, op, rootVar), 2));
    parts.push("}");
    return parts.join("\n");
  }
  // Header with source JSON as string + parse when provided
  if (source !== undefined) {
    let jsonText = "";
    try { jsonText = JSON.stringify(source, null, 2) ?? ""; } catch { jsonText = ""; }
    // JavaScript: use template literal (HEREDOC analogue). Escape backticks and `${` to prevent interpolation.
    if (lang === "javascript" || lang === "typescript") {
      const jsSafe = jsonText
        .replace(/`/g, "\\`")
        .replace(/\$\{/g, "${'${'}");
      lines.push(`// Generated by JSON Tool UI\nconst jsonString = \`\n${jsSafe}\n\`;\nlet ${rootVar} = JSON.parse(jsonString);\nconst __root = ${rootVar};`);
    }
    // Python: use triple-quoted string (HEREDOC analogue)
    if (lang === "python") {
      lines.push(`# Generated by JSON Tool UI\nimport json\njson_string = '''\n${jsonText}\n'''\n${rootVar} = json.loads(json_string)\n__root = ${rootVar}`);
    }
    if (lang === "php") {
      // Use NOWDOC (HEREDOC-style) to embed JSON without escaping
      lines.push(`// Generated by JSON Tool UI\n$json_string = <<<'JSON_PAYLOAD'\n${jsonText}\nJSON_PAYLOAD;\n$${rootVar} = json_decode($json_string, true);\n$__root = $${rootVar};`);
    }
  } else {
    // Fallback to previous behavior if no source provided
    if (lang === "javascript" || lang === "typescript") lines.push(`// Generated by JSON Tool UI\nlet ${rootVar} = ${rootVar};\nconst __root = ${rootVar};`);
    if (lang === "python") lines.push(`# Generated by JSON Tool UI\n${rootVar} = ${rootVar}\n__root = ${rootVar}`);
    if (lang === "php") lines.push("// Generated by JSON Tool UI\n$" + rootVar + " = $" + rootVar + ";\n$__root = $" + rootVar + ";");
  }
  for (const op of ops) lines.push(generateOperation(lang, op, rootVar));
  return lines.join("\n\n");
}

function safeJson(v: unknown): string {
  try { return JSON.stringify(v); } catch { return '"<unserializable>"'; }
}
