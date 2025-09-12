"use client";
import React, { useRef, useState } from "react";
import clsx from "clsx";
import { useIsMobile } from "./hooks/useMediaQuery";

type Col = {
  id: string;
  min?: number;
  max?: number;
  initial: number; // percentage
  content: React.ReactNode;
};

export function ResizableColumns({ cols }: { cols: Col[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sizes, setSizes] = useState<number[]>(cols.map((c) => c.initial));
  const isMobile = useIsMobile();
  const [activeIdx, setActiveIdx] = useState(1); // default middle column on mobile

  const startDrag = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const container = containerRef.current!;
    const rect = container.getBoundingClientRect();
    const startSizes = [...sizes];
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const pctDelta = (dx / rect.width) * 100;
      const left = Math.max(10, Math.min(80, startSizes[idx] + pctDelta));
      const right = Math.max(10, Math.min(80, startSizes[idx + 1] - pctDelta));
      const newSizes = [...startSizes];
      newSizes[idx] = left;
      newSizes[idx + 1] = right;
      setSizes(newSizes);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (isMobile) {
    return (
      <div ref={containerRef} className="flex w-full h-full min-h-0 overflow-hidden flex-col">
        <div className="flex items-center gap-1 p-2 border-b border-neutral-200 dark:border-neutral-800">
          {cols.map((c, i) => (
            <button
              key={c.id}
              className={clsx("tab-btn", i === activeIdx && "tab-btn--active")}
              onClick={() => setActiveIdx(i)}
            >
              {c.id}
            </button>
          ))}
          <div className="ml-auto">
            <button
              className="tab-btn"
              onClick={() => {
                try {
                  window.dispatchEvent(new CustomEvent("open-catalog"));
                } catch {}
              }}
            >
              Catalog
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          {cols.map((col, i) => (
            <div key={col.id} className={clsx("h-full min-h-0 flex flex-col", i === activeIdx ? "block" : "hidden")}>{col.content}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex w-full h-full min-h-0 overflow-hidden">
      {cols.map((col, i) => (
        <React.Fragment key={col.id}>
          <div style={{ width: `${sizes[i]}%` }} className="h-full min-h-0 min-w-[180px] flex flex-col">
            {col.content}
          </div>
          {i < cols.length - 1 && (
            <div
              role="separator"
              aria-orientation="vertical"
              onMouseDown={(e) => startDrag(i, e)}
              className={clsx(
                "w-1 cursor-col-resize bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700",
                "select-none"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
