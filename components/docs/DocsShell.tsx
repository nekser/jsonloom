"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { docsNavItems, docsTocForPath } from "@/src/docs/site";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const toc = docsTocForPath(pathname);
  const contentRootRef = useRef<HTMLElement | null>(null);
  const [activeHash, setActiveHash] = useState<string>("");

  useEffect(() => {
    setActiveHash(window.location.hash || toc[0]?.href || "");
  }, [pathname, toc]);

  const scrollToHash = (hash: string, behavior: ScrollBehavior) => {
    if (!hash.startsWith("#")) return;
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    const contentRoot = contentRootRef.current;
    const desktopContainerVisible = contentRoot && window.getComputedStyle(contentRoot).display !== "none";

    if (desktopContainerVisible) {
      const targetInContainer = contentRoot.querySelector<HTMLElement>(`#${escapeCssId(id)}`);
      if (targetInContainer) {
        const containerTop = contentRoot.getBoundingClientRect().top;
        const targetTop = targetInContainer.getBoundingClientRect().top;
        const nextTop = targetTop - containerTop + contentRoot.scrollTop - 16;
        contentRoot.scrollTo({ top: Math.max(nextTop, 0), behavior });
        setActiveHash(`#${id}`);
        history.replaceState(null, "", `#${id}`);
        return;
      }
    }

    const fallbackTarget = findVisibleAnchorTarget(id);
    if (!fallbackTarget) return;
    fallbackTarget.scrollIntoView({ behavior, block: "start" });
    setActiveHash(`#${id}`);
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
      const contentRoot = contentRootRef.current;
      const exists = contentRoot?.querySelector<HTMLElement>(`#${escapeCssId(id)}`) || document.getElementById(id);
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

  useEffect(() => {
    const contentRoot = contentRootRef.current;
    if (!contentRoot) return;
    const isVisible = window.getComputedStyle(contentRoot).display !== "none";
    if (!isVisible || toc.length === 0) return;

    const sectionEntries = toc
      .map((item) => {
        const id = item.href.startsWith("#") ? item.href.slice(1) : item.href;
        const section = contentRoot.querySelector<HTMLElement>(`#${escapeCssId(id)}`);
        return section ? { href: item.href, section } : null;
      })
      .filter((entry): entry is { href: string; section: HTMLElement } => Boolean(entry));
    if (sectionEntries.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;

        const first = visible[0].target as HTMLElement;
        const found = sectionEntries.find((entry) => entry.section === first);
        if (!found) return;
        setActiveHash((prev) => (prev === found.href ? prev : found.href));
      },
      {
        root: contentRoot,
        threshold: [0, 0.2, 0.5, 1],
        rootMargin: "-10% 0px -70% 0px",
      }
    );

    for (const entry of sectionEntries) {
      observer.observe(entry.section);
    }

    return () => observer.disconnect();
  }, [pathname, toc]);

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
                      className={`block rounded px-2 py-1 text-sm ${activeHash === item.href ? "bg-muted text-foreground" : "hover:bg-muted"}`}
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
          <div className="grid h-[calc(100vh-7rem)] grid-cols-[220px_minmax(0,1fr)_220px] gap-4">
            <aside className="h-full overflow-y-auto px-2">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
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

            <main ref={contentRootRef} className="h-full min-w-0 overflow-y-auto px-2 lg:px-4">
              <div className="docs-flow mx-auto max-w-none">{children}</div>
            </main>

            <aside className="h-full overflow-y-auto px-2">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</h2>
                <nav className="space-y-2">
                  {toc.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(event) => onTocClick(event, item.href)}
                      className={`block rounded px-2 py-1 text-sm ${activeHash === item.href ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function findVisibleAnchorTarget(id: string): HTMLElement | null {
  const escapedId = escapeCssId(id);
  const matches = Array.from(document.querySelectorAll<HTMLElement>(`[id="${escapedId}"]`));
  if (matches.length === 0) return null;
  const visible = matches.find((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  });
  return visible ?? matches[0];
}

function escapeCssId(id: string): string {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id.replace(/"/g, '\\"');
}
