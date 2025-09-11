import { create } from "zustand";
import { nanoid } from "nanoid";
import { getOperationModule, Operation, OperationType, ValidationError } from "../operations";
import { buildPathIndex, type PathIndex } from "../utils/pathSuggest";

export type State = {
  sourceText: string;
  sourceError?: string;
  operations: Operation[];
  resultText: string;
  pipelineError?: ValidationError | undefined;
  opIndexes: PathIndex[]; // index of JSON state before each operation
  // history (operations only)
  past: Operation[][];
  future: Operation[][];
  // actions
  setSourceText: (text: string) => void;
  addOperation: (type: OperationType, config?: any) => void;
  updateOperation: (id: string, patch: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  reorderOperations: (from: number, to: number) => void;
  runPipeline: () => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
};

// ---------- Utilities ----------
const parseJSON = (txt: string): { value?: any; error?: string } => {
  try {
    return { value: txt.trim() === "" ? null : JSON.parse(txt) };
  } catch (e: any) {
    return { error: e?.message ?? "Invalid JSON" };
  }
};

const safeStringify = (v: any): string => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
};

function validateOp(op: Operation, input: any): string | undefined {
  const mod = getOperationModule(op.type);
  return mod?.validate(op.config as any, input);
}

function runAll(input: any, ops: Operation[]): { output?: any; error?: ValidationError; indexes: PathIndex[] } {
  try {
    let cur = input;
    const indexes: PathIndex[] = [];
    for (const op of ops) {
      // Index the state BEFORE applying this op
      indexes.push(buildPathIndex(cur));
  const mod = getOperationModule(op.type);
  if (!mod) return { error: { opId: op.id, message: `Operation type '${op.type}' is not registered` }, indexes };
  const err = mod.validate(op.config as any, cur);
  if (err) return { error: { opId: op.id, message: err }, indexes };
  cur = mod.apply(cur, op.config as any);
    }
    return { output: cur, indexes };
  } catch (e: any) {
    return { error: { message: e?.message ?? "Pipeline failed" }, indexes: [] };
  }
}

export const useOpsStore = create<State>()((set, get) => ({
  sourceText: "{\n  \"items\": [1, 2, 3],\n  \"user\": { \"id\": 1, \"name\": \"Alice\" }\n}",
  operations: [],
  resultText: "",
  opIndexes: [],
  past: [],
  future: [],
  setSourceText: (text: string) => {
    const max = 5 * 1024 * 1024; // 5MB
    const size = new Blob([text]).size;
    if (size > max) {
      set({ sourceText: text.slice(0, 1024), sourceError: "JSON exceeds 5 MB limit" });
      return;
    }
    const parsed = parseJSON(text);
    set({ sourceText: text, sourceError: parsed.error });
    get().runPipeline();
  },
  addOperation: (type: OperationType, config: any = {}) => {
    const mod = getOperationModule(type);
    const initial = Object.keys(config).length ? config : (mod?.defaultConfig ?? {});
    set((s) => ({
      past: [...s.past, s.operations],
      future: [],
      operations: [...s.operations, { id: nanoid(), type, config: initial }],
    }));
    get().runPipeline();
  },
  updateOperation: (id: string, patch: Partial<Operation>) => {
  set((s) => ({
      past: [...s.past, s.operations],
      future: [],
      operations: s.operations.map((op) =>
        op.id === id ? { ...op, ...patch, config: { ...op.config, ...patch.config } } : op
      ),
    }));
    get().runPipeline();
  },
  deleteOperation: (id: string) => {
  set((s) => ({
      past: [...s.past, s.operations],
      future: [],
      operations: s.operations.filter((op) => op.id !== id),
    }));
    get().runPipeline();
  },
  reorderOperations: (from: number, to: number) => {
  set((s) => {
      const arr = [...s.operations];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { past: [...s.past, s.operations], future: [], operations: arr } as Partial<State> as State;
    });
    get().runPipeline();
  },
  runPipeline: () => {
    const { sourceText, operations } = get();
    const parsed = parseJSON(sourceText);
  if (parsed.error) return set({ resultText: "", pipelineError: { message: parsed.error }, opIndexes: [] });
  const res = runAll(parsed.value, operations);
  if (res.error) return set({ resultText: "", pipelineError: res.error, opIndexes: res.indexes });
  set({ resultText: safeStringify(res.output), pipelineError: undefined, opIndexes: res.indexes });
  },
  clearAll: () =>
    set({
      sourceText: "",
      sourceError: undefined,
      operations: [],
      resultText: "",
      pipelineError: undefined,
      past: [],
      future: [],
    }),
  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s;
      const past = [...s.past];
      const prev = past.pop() as Operation[];
      const future = [s.operations, ...s.future];
      const next = { ...s, operations: prev, past, future };
      // trigger pipeline after mutation
      setTimeout(() => {
        // run after state applied
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (useOpsStore.getState().runPipeline());
      }, 0);
      return next;
    }),
  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      const past = [...s.past, s.operations];
      const out = { ...s, operations: next, past, future: rest };
      setTimeout(() => {
        (useOpsStore.getState().runPipeline());
      }, 0);
      return out;
    }),
}));

export type { OperationType };
export type {
  FilterByKeyConfig,
  RenameKeyConfig,
  MapArrayConfig,
  ExtractPathConfig,
  StringReplaceConfig,
  FilterArrayConfig,
  SortArrayConfig,
  UniqueArrayConfig,
  FlattenArrayConfig,
  SliceArrayConfig,
  GroupByConfig,
  ReduceArrayConfig,
  CountArrayConfig,
  JoinArrayConfig,
} from "../operations";
