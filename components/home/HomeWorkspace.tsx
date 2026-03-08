"use client";

import { ResizableColumns } from "@/components/ResizableColumns";
import { SourceEditor, ResultEditor } from "@/components/JsonEditors";
import { OperationsPanel } from "@/components/OperationsPanel";

export default function HomeWorkspace() {
  return (
    <ResizableColumns
      cols={[
        { id: "Source", initial: 34, content: <SourceEditor /> },
        { id: "Pipeline", initial: 32, content: <OperationsPanel /> },
        { id: "Preview", initial: 34, content: <ResultEditor /> },
      ]}
    />
  );
}
