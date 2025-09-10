import type { OperationModule, OperationType } from "./types";
import FilterByKey from "./FilterByKey";
import RenameKey from "./RenameKey";
import MapArray from "./MapArray";
import ExtractPath from "./ExtractPath";
import StringReplace from "./StringReplace";

const registry: Record<OperationType, OperationModule<any>> = {
  FilterByKey,
  RenameKey,
  MapArray,
  ExtractPath,
  StringReplace,
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
