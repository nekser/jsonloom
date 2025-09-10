"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

type AutocompleteInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  // Returns a list of suggestions for the current token/query.
  getSuggestions: (query: string) => string[];
  // Optional delimiter to support multi-value inputs (e.g., comma-separated).
  splitBy?: string | null;
  // Max suggestions to render.
  limit?: number;
};

export default function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  getSuggestions,
  splitBy = null,
  limit = 50,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { head, token, tail } = useMemo(() => {
    if (!splitBy) return { head: "", token: value, tail: "" };
    const parts = value.split(splitBy);
    const t = parts.pop() ?? "";
    const h = parts.length ? parts.join(splitBy) + splitBy : "";
    const tailSpace = value.endsWith(splitBy) ? splitBy : "";
    return { head: h, token: t.trimStart(), tail: tailSpace };
  }, [value, splitBy]);

  const suggestions = useMemo(() => {
    // Always ask provider; when token is empty, this enables showing top-level suggestions
    const list = getSuggestions(token ?? "");
    return list.slice(0, limit);
  }, [getSuggestions, token, limit]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    setInputWidth(el.offsetWidth);
  }, [inputRef.current]);

  useEffect(() => {
    setHighlight(0);
  }, [token]);

  const applySuggestion = (s: string) => {
    const next = splitBy ? `${head}${s}${tail}` : s; // replace current token
    onChange(next);
    setOpen(false);
    // keep focus on input
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (suggestions[highlight]) {
        e.preventDefault();
        applySuggestion(suggestions[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={clsx("relative", className)}>
      <input
        ref={inputRef}
        className={clsx("border rounded px-2 py-1 w-full", className)}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          // delay close to allow click selection
          setTimeout(() => setOpen(false), 100);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
      />
      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 mt-1 max-h-56 overflow-auto rounded border bg-white dark:bg-neutral-900 text-sm shadow-lg"
          style={{ minWidth: inputWidth ?? undefined }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s + i}
              type="button"
              className={clsx(
                "block w-full text-left px-2 py-1",
                i === highlight
                  ? "bg-neutral-100 dark:bg-neutral-800"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
              )}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applySuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
