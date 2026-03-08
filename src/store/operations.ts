import { create } from "zustand";
import { nanoid } from "nanoid";
import { getOperationModule, Operation, OperationType, ValidationError } from "../operations/index";
import type { JSONValue } from "../types/json";
import { isJSONObject } from "../types/json";
import { type PathIndex } from "../utils/pathSuggest";
import { executePipelineFromSource } from "../operations/pipelineExecution";
import { applyOperationPatch } from "../operations/configPatch";
import { executePipelinePreferWorker } from "../operations/worker/client";

export type State = {
  sourceText: string;
  sourceError?: string;
  sourceFormat: "json";
  operations: Operation[];
  resultText: string;
  pipelineError?: ValidationError | undefined;
  pipelinePerf: {
    lastRunMs: number;
    avgRunMs: number;
    runs: number;
    slow: boolean;
    mode: "main" | "worker";
  };
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

const safeStringify = (v: JSONValue): string => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
};

const SOURCE_DEBOUNCE_MS = 180;
const SLOW_RUN_MS = 120;
const EXECUTION_MODE: "main" | "worker" = process.env.NEXT_PUBLIC_PIPELINE_EXECUTION_MODE === "worker" ? "worker" : "main";
let sourceDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let pipelineRunVersion = 0;

export const useOpsStore = create<State>()((set, get) => ({
  sourceText: "{\n  \"items\": [1, 2, 3],\n  \"user\": { \"id\": 1, \"name\": \"Alice\" }\n}",
  sourceFormat: "json",
  operations: [],
  resultText: "",
  pipelinePerf: { lastRunMs: 0, avgRunMs: 0, runs: 0, slow: false, mode: "main" },
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
    const parsed = importJSON(text);
    set({ sourceText: text, sourceError: parsed.error });
    if (sourceDebounceTimer) clearTimeout(sourceDebounceTimer);
    sourceDebounceTimer = setTimeout(() => {
      void get().runPipeline();
      sourceDebounceTimer = null;
    }, SOURCE_DEBOUNCE_MS);
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
    void get().runPipeline();
  },
  setOperations: (ops: Operation[]) => {
    set((s) => ({ past: [...s.past, s.operations], future: [], operations: ops }));
    void get().runPipeline();
  },
  updateOperation: (id: string, patch: Partial<Operation>) => {
    set((s) => ({
      past: [...s.past, s.operations],
      future: [],
      operations: s.operations.map((op) => (op.id !== id ? op : applyOperationPatch(op, patch))),
    }));
    void get().runPipeline();
  },
  deleteOperation: (id: string) => {
  set((s) => ({
      past: [...s.past, s.operations],
      future: [],
      operations: s.operations.filter((op) => op.id !== id),
    }));
    void get().runPipeline();
  },
  reorderOperations: (from: number, to: number) => {
  set((s) => {
      const arr = [...s.operations];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { past: [...s.past, s.operations], future: [], operations: arr } as Partial<State> as State;
    });
    void get().runPipeline();
  },
  runPipeline: async () => {
  const { sourceText, sourceFormat, operations, pipelinePerf } = get();
  const runVersion = ++pipelineRunVersion;
  const started = Date.now();

  const exec = EXECUTION_MODE === "worker"
    ? await executePipelinePreferWorker({ sourceText, sourceFormat, operations })
    : { result: executePipelineFromSource({ sourceText, sourceFormat, operations }), mode: "main" as const };

  if (runVersion !== pipelineRunVersion) return;

  const durationMs = Date.now() - started;
  const runs = pipelinePerf.runs + 1;
  const avgRunMs = Math.round(((pipelinePerf.avgRunMs * pipelinePerf.runs) + durationMs) / runs);
  const nextPerf = {
    lastRunMs: durationMs,
    avgRunMs,
    runs,
    slow: durationMs >= SLOW_RUN_MS,
    mode: exec.mode,
  } as const;

  if (!exec.result.ok) {
    set({ resultText: "", pipelineError: { message: exec.result.parseError }, opIndexes: [], intermediate: {}, pipelinePerf: nextPerf });
    return;
  }

  const res = exec.result.run;
  if (res.error) {
    const interText: Record<string, string> = {};
    for (const [id, v] of Object.entries(res.inter)) interText[id] = safeStringify(v as JSONValue);
    set({ resultText: "", pipelineError: res.error, opIndexes: res.indexes, intermediate: interText, pipelinePerf: nextPerf });
    return;
  }
  const interText: Record<string, string> = {};
  for (const [id, v] of Object.entries(res.inter)) interText[id] = safeStringify(v as JSONValue);
  set({ resultText: safeStringify((res.output ?? null) as JSONValue), pipelineError: undefined, opIndexes: res.indexes, intermediate: interText, pipelinePerf: nextPerf });
  },
  clearAll: () =>
    set({
      sourceText: "",
      sourceError: undefined,
      operations: [],
      resultText: "",
      pipelineError: undefined,
      pipelinePerf: { lastRunMs: 0, avgRunMs: 0, runs: 0, slow: false, mode: "main" },
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
