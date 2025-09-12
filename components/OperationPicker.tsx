"use client";
import { useEffect, useMemo, useState } from "react";
import { useOpsStore, type State, type OperationType } from "../store/operations";
import { operationCatalog, type OperationMeta } from "../operations/operationRegistry";
import { useIsMobile } from "./hooks/useMediaQuery";

export default function OperationPicker({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange: (v: boolean) => void; onSelect?: (type: OperationType) => void }) {
  const add = useOpsStore((s: State) => s.addOperation);
  const catalog = operationCatalog;
  const isMobile = useIsMobile();

  // Search state with debounce
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 180);
    return () => clearTimeout(t);
  }, [search]);

  const normalize = (s: string) => s.toLowerCase();
  const match = (item: OperationMeta, q: string) =>
    normalize(item.label).includes(normalize(q)) || normalize(item.description).includes(normalize(q)) || normalize(item.type).includes(normalize(q));

  const filtered = useMemo(() => {
    if (!debounced.trim()) return catalog;
    return catalog.filter((it) => match(it, debounced));
  }, [catalog, debounced]);

  const commitSelection = (item: OperationMeta) => {
    if (onSelect) onSelect(item.type);
    else add(item.type);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <div>
      <button className="text-sm px-3 py-1.5 rounded border" onClick={() => onOpenChange(true)}>
        Add Operation
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => onOpenChange(false)}>
          {isMobile ? (
            <div className="absolute inset-x-0 bottom-0 h-[85vh] op-surface rounded-t-md shadow-lg p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Add Operation</div>
                <button className="text-sm" onClick={() => onOpenChange(false)}>Close</button>
              </div>
              <div className="space-y-3 flex-1 min-h-0">
                <div>
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Search operations…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                  <CatalogList items={filtered} query={debounced} onSelect={commitSelection} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
              <div className="op-surface rounded-md shadow-lg w-[620px] max-w-[95vw] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Add Operation</div>
                  <button className="text-sm" onClick={() => onOpenChange(false)}>Close</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Search operations…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <CatalogList items={filtered} query={debounced} onSelect={commitSelection} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CatalogList({ items, query, onSelect }: { items: OperationMeta[]; query: string; onSelect: (m: OperationMeta) => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const it of items) initial[it.category] = true;
    return initial;
  });
  const grouped = useMemo(() => {
    const m = new Map<string, OperationMeta[]>();
    for (const it of items) {
      const key = it.category;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(it);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    const before = text.slice(0, i);
    const mid = text.slice(i, i + q.length);
    const after = text.slice(i + q.length);
    return (
      <>
        {before}
        <span className="font-semibold">{mid}</span>
        {after}
      </>
    );
  };

  if (items.length === 0) return <div className="text-center text-sm text-neutral-500 py-8">No operations match your search.</div>;

  return (
    <div className="space-y-2 max-h-[60vh] overflow-auto">
    {grouped.map(([cat, ops]) => {
        const isCollapsed = !!collapsed[cat];
        return (
      <div key={cat} className="border rounded op-surface">
            <button
        className="w-full flex items-center justify-between px-3 py-2 text-left op-surface"
              onClick={() => setCollapsed((s) => ({ ...s, [cat]: !s[cat] }))}
            >
              <span className="font-medium">{cat} Operations</span>
              <span className="text-xs text-neutral-500">{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>
            {!isCollapsed && (
              <div className="p-2 space-y-2">
                {ops.map((item) => (
                  <button
                    key={item.type}
          className="w-full text-left border rounded p-3 op-surface hover:border-neutral-300 dark:hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700"
                    onClick={() => onSelect(item)}
                  >
                    <div className="font-medium">{highlight(item.label, query)}</div>
                    <div className="text-xs text-neutral-500">{highlight(item.description, query)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
