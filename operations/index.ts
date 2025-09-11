import type { OperationModule, OperationType } from "./types";
import FilterByKey from "./FilterByKey";
import RenameKey from "./RenameKey";
import MapArray from "./MapArray";
import ExtractPath from "./ExtractPath";
import StringReplace from "./StringReplace";
import FilterArray from "./FilterArray";
import SortArray from "./SortArray";
import UniqueArray from "./UniqueArray";
import FlattenArray from "./FlattenArray";
import SliceArray from "./SliceArray";
import GroupBy from "./GroupBy";
import ReduceArray from "./ReduceArray";
import CountArray from "./CountArray";
import JoinArray from "./JoinArray";

const registry: Record<OperationType, OperationModule<any>> = {
  FilterByKey,
  RenameKey,
  MapArray,
  ExtractPath,
  StringReplace,
  FilterArray,
  SortArray,
  UniqueArray,
  FlattenArray,
  SliceArray,
  GroupBy,
  ReduceArray,
  CountArray,
  JoinArray,
};

export function getOperationModule(type: OperationType): OperationModule<any> {
  return registry[type];
}

export * from "./types";
export type { FilterByKeyConfig } from "./FilterByKey";
export type { RenameKeyConfig } from "./RenameKey";
export type { MapArrayConfig } from "./MapArray";
export type { ExtractPathConfig } from "./ExtractPath";
export type { StringReplaceConfig } from "./StringReplace";
export type { FilterArrayConfig } from "./FilterArray";
export type { SortArrayConfig } from "./SortArray";
export type { UniqueArrayConfig } from "./UniqueArray";
export type { FlattenArrayConfig } from "./FlattenArray";
export type { SliceArrayConfig } from "./SliceArray";
export type { GroupByConfig } from "./GroupBy";
export type { ReduceArrayConfig } from "./ReduceArray";
export type { CountArrayConfig } from "./CountArray";
export type { JoinArrayConfig } from "./JoinArray";
