import { useEffect, useState } from "react";

export function useEditorTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () => {
      const attr = root.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") {
        setTheme(attr);
        return;
      }
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    };

    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => mo.disconnect();
  }, []);

  return theme;
}
