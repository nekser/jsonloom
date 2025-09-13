"use client";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useIsMobile } from "./hooks/useMediaQuery";
import { useOpsStore, State } from "../src/store/operations";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button as UIButton } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const isMobile = useIsMobile();
  // Undo/Redo moved to Operations toolbar
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const setSourceText = useOpsStore((s: State) => s.setSourceText);
  const setSourceFormat = useOpsStore((s: State) => s.setSourceFormat);
  const setOperations = useOpsStore((s: State) => s.setOperations);

  async function loadDemo(kind: "json" | "yaml" | "csv") {
    try {
      const dataUrl = kind === "json" ? "/demo/demo.json" : kind === "yaml" ? "/demo/demo.yaml" : "/demo/demo.csv";
      const res = await fetch(dataUrl, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load ${kind} demo (${res.status})`);
      const text = await res.text();
      setSourceFormat(kind);
      setSourceText(text);
  // Load pipeline; CSV uses a dedicated pipeline since its shape differs
  const pipelineUrl = kind === "csv" ? "/demo/pipeline-csv.json" : "/demo/pipeline.json";
  const pRes = await fetch(pipelineUrl, { cache: "no-cache" });
      if (pRes.ok) {
        const pipelineDoc = await pRes.json();
        const { PipelineSerializer } = await import("../src/utils/sharing/PipelineSerializer");
        const { PipelineValidator } = await import("../src/utils/sharing/PipelineValidator");
        const ops = PipelineSerializer.deserialize(pipelineDoc);
        if (ops) {
          const v = PipelineValidator.validate(ops as any);
          if (v.ok) setOperations(ops as any);
        }
      }
    } catch (e) {
      // silent fail; optionally hook toasts
    }
  }

  if (isLanding) {
    return (
      <header className="h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
        <Link href="/" className="font-semibold">YourApp</Link>
        <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#features">Features</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/blog">Blog</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm"><Link href="/free">Try Free Transformer</Link></Button>
          <ThemeToggle />
        </div>
      </header>
    );
  }

  return (
    <header className="h-12 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
      <div className="font-semibold mr-auto">JSON Transformation Tool</div>
      {!isMobile ? (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UIButton variant="outline" size="sm">Demo</UIButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => loadDemo("json")}>Load JSON Demo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadDemo("yaml")}>Load YAML Demo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadDemo("csv")}>Load CSV Demo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UIButton variant="outline" size="sm">Demo</UIButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => loadDemo("json")}>Load JSON Demo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadDemo("yaml")}>Load YAML Demo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadDemo("csv")}>Load CSV Demo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      )}
    </header>
  );
}
