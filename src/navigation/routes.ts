import { DOCS_AND_CODEGEN_ENABLED } from "@/src/config/features";

export const APP_ROUTES = {
  home: "/",
  docs: "/docs",
  about: "/about",
} as const;

export function getDocsRoutes(enabled = DOCS_AND_CODEGEN_ENABLED): readonly string[] {
  if (!enabled) return [];
  return [
    APP_ROUTES.docs,
    "/docs/getting-started",
    "/docs/operations",
    "/docs/codegen",
    "/docs/sharing",
    "/docs/troubleshooting",
  ] as const;
}

export function getActivePublicRoutes(enabled = DOCS_AND_CODEGEN_ENABLED): readonly string[] {
  if (!enabled) return [APP_ROUTES.home, APP_ROUTES.about] as const;
  return [APP_ROUTES.home, APP_ROUTES.docs, APP_ROUTES.about] as const;
}

export function getIndexableRoutes(enabled = DOCS_AND_CODEGEN_ENABLED): readonly string[] {
  return [APP_ROUTES.home, APP_ROUTES.about, ...getDocsRoutes(enabled)] as const;
}

export const DOCS_ROUTES = getDocsRoutes();
export const ACTIVE_PUBLIC_ROUTES = getActivePublicRoutes();
export const INDEXABLE_ROUTES = getIndexableRoutes();

export const DEFERRED_ROUTES = ["/pricing", "/blog"] as const;
