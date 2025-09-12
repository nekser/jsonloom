"use client";
import { ResizableColumns } from "../components/ResizableColumns";
import { SourceEditor, ResultEditor } from "../components/JsonEditors";
import { OperationsPanel } from "../components/OperationsPanel";
import { useOpsStore, State } from "../store/operations";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  // old header actions removed per new header spec

  return (
    <div className="min-h-screen h-screen flex flex-col">
      <main className="flex-1 min-h-0">
        <ResizableColumns
          cols={[
            { id: "Source", initial: 34, content: <SourceEditor /> },
            { id: "Pipeline", initial: 32, content: <OperationsPanel /> },
            { id: "Preview", initial: 34, content: <ResultEditor /> },
          ]}
        />
      </main>
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
