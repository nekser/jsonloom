"use client";
import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { useOpsStore, State } from "../src/store/operations";
import SourcePanelToolbar from "./SourcePanelToolbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResultPanelToolbar from "./ResultPanelToolbar";

export function SourceEditor() {
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const sourceError = useOpsStore((s: State) => s.sourceError);
  const sourceFormat = useOpsStore((s: State) => s.sourceFormat);
  const setSourceFormat = useOpsStore((s: State) => s.setSourceFormat);
  const setSourceText = useOpsStore((s: State) => s.setSourceText);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    // fallback to class or system preference
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  useEffect(() => {
    // run once to compute initial result
    useOpsStore.getState().runPipeline();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () => {
      const t = root.getAttribute("data-theme");
      if (t === "dark" || t === "light") {
        setTheme(t);
        return;
      }
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex h-12 items-center justify-between px-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-medium flex items-center gap-2">
          Source
          <Select value={sourceFormat} onValueChange={(v: any) => setSourceFormat(v)}>
            <SelectTrigger className="h-7 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-neutral-500">{new Blob([sourceText]).size} bytes</div>
          <SourcePanelToolbar />
        </div>
      </div>
  <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme={theme === "dark" ? "vs-dark" : "light"}
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
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () => {
      const t = root.getAttribute("data-theme");
      if (t === "dark" || t === "light") {
        setTheme(t);
        return;
      }
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => mo.disconnect();
  }, []);
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex h-12 items-center justify-between px-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-medium">Result JSON</div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-neutral-500">{new Blob([resultText]).size} bytes</div>
          <ResultPanelToolbar />
        </div>
      </div>
  <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme={theme === "dark" ? "vs-dark" : "light"}
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
