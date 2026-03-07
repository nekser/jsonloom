export const APP_ROUTES = {
  home: "/",
  free: "/free",
  docs: "/docs",
  about: "/about",
} as const;

export const LANDING_NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Docs", href: APP_ROUTES.docs },
  { label: "About", href: APP_ROUTES.about },
] as const;

export const DEFERRED_ROUTES = ["/pricing", "/blog"] as const;
