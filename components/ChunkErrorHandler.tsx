"use client";

import { useEffect } from "react";

const RELOAD_GUARD_KEY = "__next_chunk_reload_once__";

function isChunkLoadErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("chunkloaderror") || normalized.includes("loading chunk");
}

function reloadOnceForChunkError(reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason ?? "");
  if (!isChunkLoadErrorMessage(message)) return;

  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY) === "1") return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  } catch {
    return;
  }

  window.location.reload();
}

export default function ChunkErrorHandler() {
  useEffect(() => {
    try {
      sessionStorage.removeItem(RELOAD_GUARD_KEY);
    } catch {
      // Ignore storage access issues.
    }

    const onError = (event: ErrorEvent) => reloadOnceForChunkError(event.error ?? event.message);
    const onUnhandledRejection = (event: PromiseRejectionEvent) => reloadOnceForChunkError(event.reason);

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
