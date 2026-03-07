"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect } from "react";
import { docsNavItems, docsTocForPath } from "@/src/docs/site";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const toc = docsTocForPath(pathname);

  const scrollToHash = (hash: string, behavior: ScrollBehavior) => {
    if (!hash.startsWith("#")) return;
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    const target = findVisibleAnchorTarget(id);
    if (!target) return;

    target.scrollIntoView({ behavior, block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const onTocClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    event.preventDefault();
    scrollToHash(href, "smooth");
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    // Retry for streamed/hydrated content that may mount after first paint.
    let attempts = 0;
    const maxAttempts = 20;
    const tick = () => {
      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;
      const exists = document.getElementById(id);
      if (exists) {
        scrollToHash(hash, "auto");
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(tick, 75);
      }
    };
    requestAnimationFrame(tick);
  }, [pathname]);

  return (
    <div className="relative bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-6 md:px-6 lg:px-0">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <div className="text-sm font-medium text-muted-foreground">Documentation</div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" /> On this page
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sections</h2>
                <nav className="space-y-2">
                  {toc.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(event) => onTocClick(event, item.href)}
                      className="block rounded px-2 py-1 text-sm hover:bg-muted"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="md:hidden">
          <main className="min-w-0">
            <div className="docs-flow">{children}</div>
          </main>
        </div>

        <div className="hidden md:block">
          <ResizablePanelGroup orientation="horizontal" className="h-[calc(100vh-7rem)] w-full items-stretch">
            <ResizablePanel defaultSize="18%" minSize="14%" maxSize="24%" collapsible>
              <aside className="h-full px-2 lg:px-4">
                <div className="sticky top-20 rounded-xl border bg-card p-4 shadow-sm">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Docs</h2>
                  <nav className="space-y-1">
                    {docsNavItems.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block rounded px-2 py-1 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </aside>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize="64%" minSize="44%">
              <main className="h-full min-w-0 overflow-y-auto px-4 lg:px-8">
                <div className="docs-flow mx-auto max-w-none">{children}</div>
              </main>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize="18%" minSize="14%" maxSize="26%" collapsible>
              <aside className="h-full px-2 lg:px-4">
                <div className="sticky top-20 rounded-xl border bg-card p-4 shadow-sm">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</h2>
                  <nav className="space-y-2">
                    {toc.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(event) => onTocClick(event, item.href)}
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}

function findVisibleAnchorTarget(id: string): HTMLElement | null {
  const escapedId = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id.replace(/"/g, '\\"');
  const matches = Array.from(document.querySelectorAll<HTMLElement>(`[id="${escapedId}"]`));
  if (matches.length === 0) return null;
  const visible = matches.find((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  });
  return visible ?? matches[0];
}
