"use client";
import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useOpsStore, State } from "../src/store/operations";
import { generatePipeline, type Lang } from "../codegen/generate";
import { downloadText } from "../lib/io";

export default function GenerateCodeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const ops = useOpsStore((s: State) => s.operations);
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

  const code = useMemo(() => generatePipeline(lang, ops), [lang, ops]);

  const copy = async () => { await navigator.clipboard.writeText(code); };
  const exportFile = () => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = lang === "javascript" ? "js" : lang === "python" ? "py" : "php";
    downloadText(`pipeline-${ts}.${ext}`, code, "text/plain");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[900px]">
        <DialogHeader>
          <DialogTitle>Generate Code</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between mb-2">
          <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copy}><Copy className="h-4 w-4 mr-2" />Copy</Button>
            <Button variant="outline" size="sm" onClick={exportFile}><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>
        <div className="h-[60vh]">
          <Editor
            height="100%"
            language={lang === "javascript" ? "javascript" : lang === "python" ? "python" : "php"}
            theme={theme === "dark" ? "vs-dark" : "light"}
            value={code}
            options={{ readOnly: true, minimap: { enabled: false }, wordWrap: "on" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
