import type { OperationType } from "../../src/store/operations";
import type { PathIndex } from "../../src/utils/pathSuggest";

export type EditorProps<TConfig> = {
  config: TConfig;
  onChange: (patch: Partial<TConfig>) => void;
  pathIndex: PathIndex;
};

// Relaxed typing so specific editors with their own config types can be registered without incompatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EditorComponent = React.FC<any>;

export type OperationEditors = Partial<Record<OperationType, EditorComponent>>;
