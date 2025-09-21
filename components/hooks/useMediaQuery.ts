"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  // Initialize to a deterministic value for SSR to avoid hydration mismatches,
  // then update on mount based on the actual media query result.
  const [matches, setMatches] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
