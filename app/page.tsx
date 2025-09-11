"use client";
import { ResizableColumns } from "../components/ResizableColumns";
import { SourceEditor, ResultEditor } from "../components/JsonEditors";
import { OperationsPanel } from "../components/OperationsPanel";
import { useOpsStore, State } from "../store/operations";
import { useState } from "react";

export default function Home() {
  const undo = useOpsStore((s: State) => s.undo);
  const redo = useOpsStore((s: State) => s.redo);
  const setSourceText = useOpsStore((s: State) => s.setSourceText);
  const setOperations = useOpsStore((s: State) => s.setOperations);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoError, setDemoError] = useState<string | undefined>(undefined);
  const [demoLoading, setDemoLoading] = useState(false);

  const download = () => {
    const text = useOpsStore.getState().resultText;
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `result-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(useOpsStore.getState().resultText);
  };
  const upload = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json,application/json";
    inp.onchange = async () => {
      const file = inp.files?.[0];
      if (!file) return;
      const text = await file.text();
      useOpsStore.getState().setSourceText(text);
    };
    inp.click();
  };
  const paste = async () => {
    const text = await navigator.clipboard.readText();
    useOpsStore.getState().setSourceText(text);
  };

  return (
    <div className="min-h-screen h-screen flex flex-col">
      <header className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
        <div className="font-semibold mr-auto">JSON Transformations</div>
        <button className="text-sm px-3 py-1.5 rounded border" onClick={paste}>Paste JSON</button>
        <button className="text-sm px-3 py-1.5 rounded border" onClick={upload}>Upload</button>
        <div className="w-px h-6 bg-neutral-300 mx-1" />
        <button className="text-sm px-3 py-1.5 rounded border" onClick={undo}>Undo</button>
        <button className="text-sm px-3 py-1.5 rounded border" onClick={redo}>Redo</button>
        <div className="w-px h-6 bg-neutral-300 mx-1" />
        <button className="text-sm px-3 py-1.5 rounded border" onClick={copy}>Copy</button>
        <button className="text-sm px-3 py-1.5 rounded border" onClick={download}>Download</button>
        <button className="text-sm px-3 py-1.5 rounded border" onClick={() => setDemoOpen(true)}>Demo</button>
      </header>
  <main className="flex-1 min-h-0">
        <ResizableColumns
          cols={[
            { id: "src", initial: 34, content: <SourceEditor /> },
            { id: "ops", initial: 32, content: <OperationsPanel /> },
            { id: "res", initial: 34, content: <ResultEditor /> },
          ]}
        />
      </main>
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDemoOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-md shadow-lg w-[640px] max-w-[95vw] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Load Demo</div>
              <button className="text-sm" onClick={() => setDemoOpen(false)}>Close</button>
            </div>
            <div className="space-y-3 text-sm">
              <p>This will replace the current Source JSON and Operations with a sample dataset and a prebuilt pipeline.</p>
              {demoError && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">{demoError}</div>
              )}
              <div className="flex gap-2">
                <button
                  disabled={demoLoading}
                  className="text-sm px-3 py-1.5 rounded border disabled:opacity-60"
                  onClick={async () => {
                    try {
                      setDemoError(undefined);
                      setDemoLoading(true);
                      const [dataRes, pipeRes] = await Promise.all([
                        fetch("/demo/data.json", { cache: "no-cache" }),
                        fetch("/demo/pipeline.json", { cache: "no-cache" }),
                      ]);
                      if (!dataRes.ok) throw new Error(`Failed to load demo data (${dataRes.status})`);
                      if (!pipeRes.ok) throw new Error(`Failed to load demo pipeline (${pipeRes.status})`);
                      const data = await dataRes.json();
                      const pipelineDoc = await pipeRes.json();
                      const ops = (await import("../utils/sharing/PipelineSerializer")).PipelineSerializer.deserialize(pipelineDoc);
                      if (!ops) throw new Error("Invalid demo pipeline payload");
                      const { PipelineValidator } = await import("../utils/sharing/PipelineValidator");
                      const v = PipelineValidator.validate(ops as any);
                      if (!v.ok) throw new Error(v.error);
                      setSourceText(JSON.stringify(data, null, 2));
                      setOperations(ops as any);
                      setDemoOpen(false);
                    } catch (e: any) {
                      setDemoError(e?.message || "Failed to load demo");
                    } finally {
                      setDemoLoading(false);
                    }
                  }}
                >{demoLoading ? "Loading…" : "Load Demo JSON + Pipeline"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
