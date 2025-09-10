"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

type Props = {
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  className?: string;
  // Suggest options based on the current token
  getSuggestions: (query: string) => string[];
  limit?: number;
};

export default function MultiAutocompleteChips({ values, onChange, placeholder, className, getSuggestions, limit = 50 }: Props) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => {
    const all = getSuggestions(token ?? "");
    // Exclude already selected values
    const filtered = all.filter((s) => !values.includes(s));
    return filtered.slice(0, limit);
  }, [getSuggestions, token, values, limit]);

  useEffect(() => setHighlight(0), [token]);

  const commit = (val: string) => {
    if (!val) return;
    if (values.includes(val)) return;
    onChange([...values, val]);
    setToken("");
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
    if ((e.key === "Enter" || e.key === "Tab" || e.key === ",") && token.trim() !== "") {
      e.preventDefault();
      commit(token.trim());
      return;
    }
    if (e.key === "Backspace" && token === "" && values.length > 0) {
      // remove last chip
      onChange(values.slice(0, -1));
      return;
    }
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      const s = suggestions[highlight];
      if (s) {
        e.preventDefault();
        commit(s);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const remove = (val: string) => onChange(values.filter((v) => v !== val));

  return (
    <div className={clsx("relative", className)} ref={wrapRef}>
      <div
        className="flex items-center gap-1 flex-wrap border rounded px-2 py-1 min-h-[34px] bg-white dark:bg-neutral-900"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">
            {v}
            <button
              type="button"
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              onClick={(e) => {
                e.stopPropagation();
                remove(v);
              }}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[80px] outline-none bg-transparent text-sm"
          placeholder={values.length === 0 ? placeholder : undefined}
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          onKeyDown={onKeyDown}
          spellCheck={false}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-56 overflow-auto rounded border bg-white dark:bg-neutral-900 text-sm shadow-lg w-full">
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
              onClick={() => commit(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
