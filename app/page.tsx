"use client";
import { ResizableColumns } from "../components/ResizableColumns";
import { SourceEditor, ResultEditor } from "../components/JsonEditors";
import { OperationsPanel } from "../components/OperationsPanel";
import { useOpsStore, State } from "../store/operations";
import { useState } from "react";
import { useIsMobile } from "../components/hooks/useMediaQuery";
import ThemeToggle from "../components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Home() {
  const undo = useOpsStore((s: State) => s.undo);
  const redo = useOpsStore((s: State) => s.redo);
  const setSourceText = useOpsStore((s: State) => s.setSourceText);
  const setOperations = useOpsStore((s: State) => s.setOperations);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoError, setDemoError] = useState<string | undefined>(undefined);
  const [demoLoading, setDemoLoading] = useState(false);
  const isMobile = useIsMobile();

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
        {!isMobile ? (
          <>
            <Button variant="outline"  onClick={paste}>Paste JSON</Button>
            <Button variant="outline"  onClick={upload}>Upload</Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="outline" onClick={undo}>Undo</Button>
            <Button variant="outline" onClick={redo}>Redo</Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="outline" onClick={copy}>Copy</Button>
            <Button variant="outline" onClick={download}>Download</Button>
            <Button variant="outline" onClick={() => setDemoOpen(true)}>Demo</Button>
            <ThemeToggle />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setDemoOpen(true)}>Demo</Button>
            <Button variant="outline" onClick={copy}>Copy</Button>
            <ThemeToggle />
          </div>
        )}
      </header>
      <main className="flex-1 min-h-0">
        <ResizableColumns
          cols={[
            { id: "Source", initial: 34, content: <SourceEditor /> },
            { id: "Pipeline", initial: 32, content: <OperationsPanel /> },
            { id: "Preview", initial: 34, content: <ResultEditor /> },
          ]}
        />
      </main>
      {isMobile && (
        <nav className="border-t border-neutral-200 dark:border-neutral-800 p-2 flex items-center justify-around gap-2">
          <Button variant="outline" size="sm" onClick={paste}>Paste</Button>
          <Button variant="outline" size="sm" onClick={upload}>Upload</Button>
          <Button variant="outline" size="sm" onClick={undo}>Undo</Button>
          <Button variant="outline" size="sm" onClick={redo}>Redo</Button>
          <Button variant="outline" size="sm" onClick={download}>Save</Button>
        </nav>
      )}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Demo</DialogTitle>
            <DialogDescription>
              This will replace the current Source JSON and Operations with a sample dataset and a prebuilt pipeline.
            </DialogDescription>
          </DialogHeader>
          {demoError && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">{demoError}</div>
          )}
          <div className="flex gap-2">
            <Button
              disabled={demoLoading}
              variant="default"
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
            >{demoLoading ? "Loading…" : "Load Demo JSON + Pipeline"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
