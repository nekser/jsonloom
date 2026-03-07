"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generatePipeline, type Lang } from "@/src/codegen/generate";
import { importCSV } from "@/src/importers/csv";
import { importJSON } from "@/src/importers/json";
import { importYAML } from "@/src/importers/yaml";
import Editor from "@monaco-editor/react";
import { Copy, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { downloadText } from "../lib/io";
import { State, useOpsStore } from "../src/store/operations";

export default function GenerateCodeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const ops = useOpsStore((s: State) => s.operations);
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const sourceFormat = useOpsStore((s: State) => s.sourceFormat);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<Lang>("javascript");

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const t = root.getAttribute("data-theme");
      if (t === "dark" || t === "light") setTheme(t);
      else setTheme(root.classList.contains("dark") ? "dark" : "light");
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => mo.disconnect();
  }, []);

  const code = useMemo(() => {
    // Parse the current source text to a JSON value regardless of input format
    let parsed: unknown = undefined;
    try {
      if (sourceFormat === "json") parsed = importJSON(sourceText).value;
      else if (sourceFormat === "yaml") parsed = importYAML(sourceText).value;
      else parsed = importCSV(sourceText).value;
    } catch {
      parsed = undefined;
    }
    return generatePipeline(lang, ops, "data", parsed);
  }, [lang, ops, sourceText, sourceFormat]);

  const copy = async () => { await navigator.clipboard.writeText(code); };
  const exportFile = () => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const ext =
      lang === "javascript"
        ? "js"
        : lang === "typescript"
        ? "ts"
        : lang === "python"
        ? "py"
        : lang === "php"
        ? "php"
        : lang === "jq"
        ? "jq"
        : "go";
    downloadText(`pipeline-${ts}.${ext}`, code, "text/plain");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-[95vw] w-[900px]">
        <DialogHeader>
          <DialogTitle>Generate Code</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between">
          <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
              <TabsTrigger value="jq">jq</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={copy} aria-label="Copy code" className="cursor-pointer">
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy code</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={exportFile} aria-label="Download code" className="cursor-pointer">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="h-[60vh]">
          <Editor
            height="100%"
            language={lang === "javascript" ? "javascript" : lang === "typescript" ? "typescript" : lang === "python" ? "python" : lang === "php" ? "php" : lang === "go" ? "go" : "shell"}
            theme={theme === "dark" ? "vs-dark" : "light"}
            value={code}
            options={{ readOnly: true, minimap: { enabled: false }, wordWrap: "on" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
