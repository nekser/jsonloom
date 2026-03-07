"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpenText, Info, MoreVertical } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PipelineEncoder } from "../src/utils/sharing/PipelineEncoder";
import { useIsMobile } from "./hooks/useMediaQuery";
import ThemeToggle from "./ThemeToggle";
import { APP_ROUTES, LANDING_NAV_LINKS } from "@/src/navigation/routes";

export default function Header() {
  const isMobile = useIsMobile();
  // Undo/Redo moved to Operations toolbar
  const pathname = usePathname();
  const isLanding = pathname === "/";

  // Helper to open a demo in a new tab by encoding both pipeline and data
  async function openDemoInNewTab(opts: { dataPath: string; pipelinePath: string }) {
    try {
      const [dataRes, pipeRes] = await Promise.all([
        fetch(opts.dataPath, { cache: "no-cache" }),
        fetch(opts.pipelinePath, { cache: "no-cache" }),
      ]);
      if (!dataRes.ok || !pipeRes.ok) return;
      const dataJson = await dataRes.json();
      const pipelineJson = await pipeRes.json(); // already serialized { v, ops }
      const encPipeline = PipelineEncoder.encode(pipelineJson);
      const encData = PipelineEncoder.encode(dataJson);
      const url = new URL(window.location.origin + "/free");
      url.searchParams.set("pipeline", encPipeline);
      url.searchParams.set("data", encData);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch {
      // no-op; could add toast
    }
  }

  if (isLanding) {
    return (
      <header className="h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
        <Link href={APP_ROUTES.home} className="font-semibold">JSON Transformation Tool</Link>
        <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          {LANDING_NAV_LINKS.map((item) =>
            item.href.startsWith("#") ? (
              <a key={item.href} href={item.href}>{item.label}</a>
            ) : (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            )
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm"><Link href={APP_ROUTES.free}>Try Free Transformer</Link></Button>
          <DropdownMenu>
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
                <Link href={APP_ROUTES.docs}><BookOpenText className="h-4 w-4 mr-2" /> Docs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={APP_ROUTES.about}><Info className="h-4 w-4 mr-2" /> About</Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Demo pipelines</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className={isMobile ? "w-screen max-w-none rounded-none" : undefined}>
                  <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>User Data Demo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/vars-data.json", pipelinePath: "/demo/vars-pipeline.json" })}>E-commerce Demo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>Date Functions Demo</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <ThemeToggle />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  }

  return (
    <header className="h-12 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
      <div className="font-semibold mr-auto">JSON Transformation Tool</div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
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
              <Link href={APP_ROUTES.docs}><BookOpenText className="h-4 w-4 mr-2" /> Docs</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.about}><Info className="h-4 w-4 mr-2" /> About</Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Demo pipelines</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={isMobile ? "w-screen max-w-none rounded-none" : undefined}>
              <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>User Data Demo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/vars-data.json", pipelinePath: "/demo/vars-pipeline.json" })}>E-commerce Demo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDemoInNewTab({ dataPath: "/demo/demo.json", pipelinePath: "/demo/pipeline.json" })}>Date Functions Demo</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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
