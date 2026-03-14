"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppWindow, BookOpenText, ChevronDown, Info, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PipelineEncoder } from "../src/utils/sharing/PipelineEncoder";
import { useIsMobile } from "./hooks/useMediaQuery";
import ThemeToggle from "./ThemeToggle";
import { APP_ROUTES } from "@/src/navigation/routes";

export default function Header() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDemoPipelinesOpen, setIsDemoPipelinesOpen] = useState(false);

  // Helper to open a demo in a new tab by encoding both pipeline and data
  async function openDemoInNewTab(opts: { dataPath: string; pipelinePath: string }) {
    try {
      const [dataRes, pipeRes] = await Promise.all([
        fetch(opts.dataPath, { cache: "no-cache" }),
        fetch(opts.pipelinePath, { cache: "no-cache" }),
      ]);
      if (!dataRes.ok || !pipeRes.ok) return;
      const dataJson = await dataRes.json();
      const pipelineJson = await pipeRes.json(); // already serialized { schemaVersion, ops }
      const encPipeline = PipelineEncoder.encode(pipelineJson);
      const encData = PipelineEncoder.encode(dataJson);
      const url = new URL(window.location.origin + "/");
      url.searchParams.set("pipeline", encPipeline);
      url.searchParams.set("data", encData);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch {
      // no-op; could add toast
    }
  }

  return (
    <header className="h-12 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
      <Link href={APP_ROUTES.home} className="mr-auto inline-flex items-center gap-2 font-semibold">
        <Image src="/brand/jsonloom-mark.svg" alt="JSONLoom" width={20} height={20} priority />
        <span>JSONLoom</span>
      </Link>
      <div className="flex items-center gap-2">
        <DropdownMenu
          open={menuOpen}
          onOpenChange={(open) => {
            setMenuOpen(open);
            if (!open) setIsDemoPipelinesOpen(false);
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={isMobile ? 0 : 4}
              className={isMobile ? "w-screen max-w-none rounded-none" : undefined}
            >
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.home}><AppWindow className="h-4 w-4 mr-2" /> Application</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.docs}><BookOpenText className="h-4 w-4 mr-2" /> Docs</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.about}><Info className="h-4 w-4 mr-2" /> About</Link>
            </DropdownMenuItem>
            {isMobile ? (
              <>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDemoPipelinesOpen((prev) => !prev);
                  }}
                  className="flex items-center justify-between"
                >
                  <span>Demo pipelines</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDemoPipelinesOpen ? "rotate-180" : ""}`} />
                </DropdownMenuItem>
                {isDemoPipelinesOpen ? (
                  <>
                    <DropdownMenuItem className="pl-6" onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>User Data Demo</DropdownMenuItem>
                    <DropdownMenuItem className="pl-6" onClick={() => openDemoInNewTab({ dataPath: "/demo/vars-data.json", pipelinePath: "/demo/vars-pipeline.json" })}>E-commerce Demo</DropdownMenuItem>
                    <DropdownMenuItem className="pl-6" onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>Date Functions Demo</DropdownMenuItem>
                  </>
                ) : null}
              </>
            ) : (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Demo pipelines</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>User Data Demo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/vars-data.json", pipelinePath: "/demo/vars-pipeline.json" })}>E-commerce Demo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>Date Functions Demo</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center justify-end gap-2"
              onSelect={(e) => e.preventDefault()}
            >
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
