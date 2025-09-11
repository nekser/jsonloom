export type OperationType =
  | "FilterByKey"
  | "RenameKey"
  | "MapArray"
  | "ExtractPath"
  | "StringReplace"
  // Array operations
  | "FilterArray"
  | "SortArray"
  | "UniqueArray"
  | "FlattenArray"
  | "SliceArray"
  | "GroupBy"
  | "ReduceArray"
  | "CountArray"
  | "JoinArray";

// Extra operations
export type ExtendedOperationType = OperationType | "MapFields";

export interface Operation<T = any> {
  id: string;
  type: OperationType;
  config: T;
}

export interface OperationModule<TConfig = any> {
  type: OperationType;
  apply: (input: any, config: TConfig) => any;
  validate: (config: TConfig, input: any) => string | undefined;
  defaultConfig?: TConfig;
}

export interface ValidationError {
  opId?: string;
  message: string;
}
