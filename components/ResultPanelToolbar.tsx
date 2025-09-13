"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Download, MoreHorizontal } from "lucide-react";
import { useOpsStore, State } from "../src/store/operations";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportJSON } from "../src/exporters/json";
import { exportYAML } from "../src/exporters/yaml";
import { copyToClipboard, downloadText } from "../lib/io";

export default function ResultPanelToolbar() {
  const resultText = useOpsStore((s: State) => s.resultText);

  const copy = async () => {
    await navigator.clipboard.writeText(resultText);
  };
  const copyAsJSON = async () => {
    const txt = resultText || "";
    await copyToClipboard(txt);
  };
  const copyAsYAML = async () => {
    const obj = safeParse(resultText);
    const txt = exportYAML(obj);
    await copyToClipboard(txt);
  };
  const downloadJSON = () => {
    const txt = resultText || "";
    downloadText(`result-${ts()}.json`, txt, "application/json");
  };
  const downloadYAML = () => {
    const obj = safeParse(resultText);
    const txt = exportYAML(obj);
    downloadText(`result-${ts()}.yaml`, txt, "text/yaml");
  };
  const ts = () => new Date().toISOString().replace(/[:.]/g, "-");
  const safeParse = (t: string) => {
    try { return t ? JSON.parse(t) : null; } catch { return null; }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Copy result" onClick={copy}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy result</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Export options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyAsJSON}>Copy as JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={copyAsYAML}>Copy as YAML</DropdownMenuItem>
            <DropdownMenuItem onClick={downloadJSON}>Download as JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={downloadYAML}>Download as YAML</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
