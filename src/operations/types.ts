export type OperationType =
  | "FilterByKey"
  | "RenameKey"
  | "MapArray"
  | "ExtractPath"
  | "StringReplace"
  // Object operations (new)
  | "RenameKeysByPattern"
  | "NormalizeKeyCase"
  | "PickPaths"
  | "OmitPaths"
  | "SetPath"
  | "DeletePath"
  | "MergeAtPath"
  | "FlattenObject"
  | "UnflattenObject"
  // Array operations
  | "FilterArray"
  | "SortArray"
  | "UniqueArray"
  | "FlattenArray"
  | "SliceArray"
  | "GroupBy"
  | "ReduceArray"
  | "CountArray"
  | "JoinArray"
  // String operations (new)
  | "RegexReplace"
  | "TrimStrings"
  | "CoerceType"
  | "TemplateInterpolate"
  | "Base64"
  | "StringCase"
  // Math operations
  | "Add"
  | "Subtract"
  | "Multiply"
  | "Divide"
  | "Modulo"
  | "Power"
  | "Round"
  | "Clamp"
  | "Sum"
  | "Count"
  | "Min"
  | "Max"
  // Control Flow
  | "If"
  | "Switch"
  | "SetVariable"
  // Validation
  | "ValidateJSON"
  // Date operations
  | "ParseDate"
  | "IsDateCompare"
  | "DateAdd"
  | "DateDiff";

// OperationType is the single source of truth for operation identifiers.

import type { JSONValue } from "../types/json";

export interface Operation<T = JSONValue> {
  id: string;
  type: OperationType;
  config: T;
  enabled?: boolean; // default true
  debugOpen?: boolean; // persisted UI state for intermediate viewer
}

export interface OperationModule<TConfig = unknown> {
  type: OperationType;
  apply: (input: JSONValue, config: TConfig) => JSONValue;
  validate: (config: TConfig, input: JSONValue) => string | undefined;
  defaultConfig?: TConfig;
}

export interface ValidationError {
  opId?: string;
  message: string;
}
