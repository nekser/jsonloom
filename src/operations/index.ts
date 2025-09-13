import type { OperationModule, OperationType } from "./types";
import FilterByKey from "./FilterByKey";
import RenameKey from "./RenameKey";
import MapArray from "./MapArray";
import ExtractPath from "./ExtractPath";
import StringReplace from "./StringReplace";
import RenameKeysByPattern from "./RenameKeysByPattern";
import NormalizeKeyCase from "./NormalizeKeyCase";
import PickPaths from "./PickPaths";
import OmitPaths from "./OmitPaths";
import SetPath from "./SetPath";
import DeletePath from "./DeletePath";
import MergeAtPath from "./MergeAtPath";
import FlattenObject from "./FlattenObject";
import UnflattenObject from "./UnflattenObject";
import FilterArray from "./FilterArray";
import SortArray from "./SortArray";
import UniqueArray from "./UniqueArray";
import FlattenArray from "./FlattenArray";
import SliceArray from "./SliceArray";
import GroupBy from "./GroupBy";
import ReduceArray from "./ReduceArray";
import CountArray from "./CountArray";
import JoinArray from "./JoinArray";
import RegexReplace from "./RegexReplace";
import TrimStrings from "./TrimStrings";
import CoerceType from "./CoerceType";
import TemplateInterpolate from "./TemplateInterpolate";
import Base64 from "./Base64";
import StringCase from "./StringCase";
import If from "./If";
import Switch from "./Switch";
import SetVariable from "./SetVariable";
import Add from "./Add";
import Subtract from "./Subtract";
import Multiply from "./Multiply";
import Divide from "./Divide";
import Modulo from "./Modulo";
import Power from "./Power";
import Round from "./Round";
import Clamp from "./Clamp";
import Sum from "./Sum";
import Count from "./Count";
import Min from "./Min";
import Max from "./Max";
import ValidateJSON from "./ValidateJSON";
import ParseDate from "./ParseDate";
import IsDateCompare from "./IsDateCompare";
import DateAdd from "./DateAdd";
import DateDiff from "./DateDiff";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<OperationType, OperationModule<any>> = {
  FilterByKey,
  RenameKey,
  MapArray,
  ExtractPath,
  StringReplace,
  RenameKeysByPattern,
  NormalizeKeyCase,
  PickPaths,
  OmitPaths,
  SetPath,
  DeletePath,
  MergeAtPath,
  FlattenObject,
  UnflattenObject,
  FilterArray,
  SortArray,
  UniqueArray,
  FlattenArray,
  SliceArray,
  GroupBy,
  ReduceArray,
  CountArray,
  JoinArray,
  RegexReplace,
  TrimStrings,
  CoerceType,
  TemplateInterpolate,
  Base64,
  StringCase,
  If,
  Switch,
  SetVariable,
  Add,
  Subtract,
  Multiply,
  Divide,
  Modulo,
  Power,
  Round,
  Clamp,
  Sum,
  Count,
  Min,
  Max,
  ValidateJSON,
  ParseDate,
  IsDateCompare,
  DateAdd,
  DateDiff,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getOperationModule(type: OperationType): OperationModule<any> {
  return registry[type];
}

export * from "./types";
export type { FilterByKeyConfig } from "./FilterByKey";
export type { RenameKeyConfig } from "./RenameKey";
export type { MapArrayConfig } from "./MapArray";
export type { ExtractPathConfig } from "./ExtractPath";
export type { StringReplaceConfig } from "./StringReplace";
export type { RenameKeysByPatternConfig } from "./RenameKeysByPattern";
export type { NormalizeKeyCaseConfig } from "./NormalizeKeyCase";
export type { PickPathsConfig } from "./PickPaths";
export type { OmitPathsConfig } from "./OmitPaths";
export type { SetPathConfig } from "./SetPath";
export type { DeletePathConfig } from "./DeletePath";
export type { MergeAtPathConfig } from "./MergeAtPath";
export type { FlattenObjectConfig } from "./FlattenObject";
export type { UnflattenObjectConfig } from "./UnflattenObject";
export type { FilterArrayConfig } from "./FilterArray";
export type { SortArrayConfig } from "./SortArray";
export type { UniqueArrayConfig } from "./UniqueArray";
export type { FlattenArrayConfig } from "./FlattenArray";
export type { SliceArrayConfig } from "./SliceArray";
export type { GroupByConfig } from "./GroupBy";
export type { ReduceArrayConfig } from "./ReduceArray";
export type { CountArrayConfig } from "./CountArray";
export type { JoinArrayConfig } from "./JoinArray";
export type { RegexReplaceConfig } from "./RegexReplace";
export type { TrimStringsConfig } from "./TrimStrings";
export type { CoerceTypeConfig } from "./CoerceType";
export type { TemplateInterpolateConfig } from "./TemplateInterpolate";
export type { Base64Config } from "./Base64";
export type { StringCaseConfig } from "./StringCase";
export type { AddConfig } from "./Add";
export type { SubtractConfig } from "./Subtract";
export type { MultiplyConfig } from "./Multiply";
export type { DivideConfig } from "./Divide";
export type { ModuloConfig } from "./Modulo";
export type { PowerConfig } from "./Power";
export type { RoundConfig } from "./Round";
export type { ClampConfig } from "./Clamp";
export type { SumConfig } from "./Sum";
export type { CountConfig } from "./Count";
export type { MinConfig } from "./Min";
export type { MaxConfig } from "./Max";
export type { ValidateJSONConfig } from "./ValidateJSON";
export type { IfConfig } from "./If";
export type { SwitchConfig } from "./Switch";
export type { SetVariableConfig } from "./SetVariable";
export type { ParseDateConfig } from "./ParseDate";
export type { IsDateCompareConfig } from "./IsDateCompare";
export type { DateAddConfig } from "./DateAdd";
export type { DateDiffConfig } from "./DateDiff";
