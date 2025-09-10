"use client";
import { ResizableColumns } from "../components/ResizableColumns";
import { SourceEditor, ResultEditor } from "../components/JsonEditors";
import { OperationsPanel } from "../components/OperationsPanel";
import { useOpsStore, State } from "../store/operations";

export default function Home() {
  const undo = useOpsStore((s: State) => s.undo);
  const redo = useOpsStore((s: State) => s.redo);

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
    </div>
  );
}
