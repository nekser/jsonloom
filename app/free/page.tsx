"use client";
import { ResizableColumns } from "@/components/ResizableColumns";
import { SourceEditor, ResultEditor } from "@/components/JsonEditors";
import { OperationsPanel } from "@/components/OperationsPanel";

export default function FreeToolPage() {
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
    </div>
  );
}
