"use client";
import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = mode === "system" ? getSystemTheme() : mode;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  // Hint the UA for form controls rendering
  (root as any).style.colorScheme = resolved;
  root.setAttribute("data-theme", resolved);
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const saved = window.localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? (saved as Theme) : "system";
  });

  const computed = useMemo(() => (mode === "system" ? getSystemTheme() : mode), [mode]);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    // keep in sync with system when in system mode
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mode]);

  const toggle = () => {
    const next: Theme = computed === "dark" ? "light" : "dark";
    setMode(next);
    try { window.localStorage.setItem("theme", next); } catch {}
  };

  const title = computed === "dark" ? "Switch to light" : "Switch to dark";
  const icon = computed === "dark" ? "🌞" : "🌙";

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className="inline-flex items-center justify-center h-11 w-11 min-w-11 min-h-11 rounded border select-none"
      onClick={toggle}
    >
      <span role="img" aria-hidden className="text-base">{icon}</span>
    </button>
  );
}
