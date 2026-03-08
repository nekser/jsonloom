export const APP_ROUTES = {
  home: "/",
  docs: "/docs",
  about: "/about",
} as const;

export const DOCS_ROUTES = [
  APP_ROUTES.docs,
  "/docs/getting-started",
  "/docs/operations",
  "/docs/codegen",
  "/docs/sharing",
  "/docs/troubleshooting",
] as const;

export const INDEXABLE_ROUTES = [
  APP_ROUTES.home,
  APP_ROUTES.about,
  ...DOCS_ROUTES,
] as const;

export const DEFERRED_ROUTES = ["/pricing", "/blog"] as const;
