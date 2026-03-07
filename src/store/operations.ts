import { create } from "zustand";
import { nanoid } from "nanoid";
import { getOperationModule, Operation, OperationType, ValidationError } from "../operations/index";
import type { JSONValue } from "../types/json";
import { isJSONObject } from "../types/json";
import { type PathIndex } from "../utils/pathSuggest";
import { runPipelineOperations } from "../operations/pipelineRunner";
import { applyOperationPatch } from "../operations/configPatch";

export type State = {
  sourceText: string;
  sourceError?: string;
  sourceFormat: "json" | "yaml" | "csv";
  operations: Operation[];
  resultText: string;
  pipelineError?: ValidationError | undefined;
  opIndexes: PathIndex[]; // index of JSON state before each operation
  intermediate?: Record<string, string>; // opId -> JSON string after this op
  // history (operations only)
  past: Operation[][];
  future: Operation[][];
  // actions
  setSourceText: (text: string) => void;
  addOperation: (type: OperationType, config?: JSONValue) => void;
  setOperations: (ops: Operation[]) => void;
  updateOperation: (id: string, patch: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  reorderOperations: (from: number, to: number) => void;
  runPipeline: () => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
};

// ---------- Utilities ----------
import { importJSON } from "../importers/json";
import { importYAML } from "../importers/yaml";
import { importCSV } from "../importers/csv";

const safeStringify = (v: JSONValue): string => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
};

export const useOpsStore = create<State>()((set, get) => ({
  sourceText: "{\n  \"items\": [1, 2, 3],\n  \"user\": { \"id\": 1, \"name\": \"Alice\" }\n}",
  sourceFormat: "json",
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
    const fmt = get().sourceFormat;
    const parsed = fmt === "json" ? importJSON(text) : fmt === "yaml" ? importYAML(text) : importCSV(text);
    set({ sourceText: text, sourceError: parsed.error });
    get().runPipeline();
  },
  addOperation: (type: OperationType, config: JSONValue = {} as JSONValue) => {
    const mod = getOperationModule(type);
    const initial: JSONValue = isJSONObject(config) && Object.keys(config).length > 0
      ? config
      : ((mod?.defaultConfig as JSONValue | undefined) ?? ({} as JSONValue));
    set((s) => ({
      past: [...s.past, s.operations],
      future: [],
      operations: [...s.operations, { id: nanoid(), type, config: initial }],
    }));
    get().runPipeline();
  },
  setOperations: (ops: Operation[]) => {
    set((s) => ({ past: [...s.past, s.operations], future: [], operations: ops }));
    get().runPipeline();
  },
  updateOperation: (id: string, patch: Partial<Operation>) => {
    set((s) => ({
      past: [...s.past, s.operations],
      future: [],
      operations: s.operations.map((op) => (op.id !== id ? op : applyOperationPatch(op, patch))),
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
  const { sourceText, sourceFormat, operations } = get();
  const parsed = sourceFormat === "json" ? importJSON(sourceText) : sourceFormat === "yaml" ? importYAML(sourceText) : importCSV(sourceText);
  if (parsed.error) return set({ resultText: "", pipelineError: { message: parsed.error }, opIndexes: [], intermediate: {} });
  const res = runPipelineOperations(parsed.value as JSONValue, operations);
  if (res.error) {
    const interText: Record<string, string> = {};
    for (const [id, v] of Object.entries(res.inter)) interText[id] = safeStringify(v as JSONValue);
    return set({ resultText: "", pipelineError: res.error, opIndexes: res.indexes, intermediate: interText });
  }
  const interText: Record<string, string> = {};
  for (const [id, v] of Object.entries(res.inter)) interText[id] = safeStringify(v as JSONValue);
  set({ resultText: safeStringify((res.output ?? null) as JSONValue), pipelineError: undefined, opIndexes: res.indexes, intermediate: interText });
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
  RegexReplaceConfig,
  TrimStringsConfig,
  CoerceTypeConfig,
  TemplateInterpolateConfig,
  Base64Config,
  StringCaseConfig,
  RenameKeysByPatternConfig,
  NormalizeKeyCaseConfig,
  PickPathsConfig,
  OmitPathsConfig,
  SetPathConfig,
  DeletePathConfig,
  MergeAtPathConfig,
  FlattenObjectConfig,
  UnflattenObjectConfig,
} from "../operations/index";
// Keep import path consistent to avoid resolving operations.json under Turbopack
// Note: These are type-only re-exports and do not affect runtime.
