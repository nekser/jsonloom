import type { OperationType } from "../../src/store/operations";

export type EditorProps<T = any> = {
  config: T;
  onChange: (patch: Partial<T>) => void;
  pathIndex: any;
};

export type EditorComponent = React.FC<EditorProps<any>>;

export type OperationEditors = Partial<Record<OperationType, EditorComponent>>;
