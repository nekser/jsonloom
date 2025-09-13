import type { OperationType } from "../../src/store/operations";
import type { PathIndex } from "../../src/utils/pathSuggest";

export type EditorProps<TConfig> = {
  config: TConfig;
  onChange: (patch: Partial<TConfig>) => void;
  pathIndex: PathIndex;
};

export type EditorComponent = React.FC<EditorProps<Record<string, unknown>>>;

export type OperationEditors = Partial<Record<OperationType, EditorComponent>>;
