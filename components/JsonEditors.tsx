"use client";
import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useOpsStore, State } from "../store/operations";

export function SourceEditor() {
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const sourceError = useOpsStore((s: State) => s.sourceError);
  const setSourceText = useOpsStore((s: State) => s.setSourceText);

  useEffect(() => {
    // run once to compute initial result
    useOpsStore.getState().runPipeline();
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between p-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-medium">Source JSON</div>
        <div className="text-xs text-neutral-500">{new Blob([sourceText]).size} bytes</div>
      </div>
  <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={sourceText}
          onChange={(val: string | undefined) => setSourceText(val ?? "")}
          options={{ minimap: { enabled: false }, wordWrap: "on" }}
        />
      </div>
      {sourceError && (
        <div className="p-2 text-xs text-red-600 border-t border-red-300 bg-red-50 dark:bg-red-950 dark:text-red-300">
          {sourceError}
        </div>
      )}
    </div>
  );
}

export function ResultEditor() {
  const resultText = useOpsStore((s: State) => s.resultText);
  const pipelineError = useOpsStore((s: State) => s.pipelineError);
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between p-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-medium">Result JSON</div>
        <div className="text-xs text-neutral-500">{new Blob([resultText]).size} bytes</div>
      </div>
  <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={pipelineError ? safeErr(pipelineError.message) : resultText}
          options={{ readOnly: true, minimap: { enabled: false }, wordWrap: "on" }}
        />
      </div>
      {pipelineError && (
        <div className="p-2 text-xs text-red-600 border-t border-red-300 bg-red-50 dark:bg-red-950 dark:text-red-300">
          {pipelineError.message}
        </div>
      )}
    </div>
  );
}

function safeErr(msg: string) {
  try {
    return JSON.stringify({ error: msg }, null, 2);
  } catch {
    return "{\n  \"error\": \"Pipeline failed\"\n}";
  }
}
