import fs from "node:fs";
import path from "node:path";
import { APP_ROUTES, DEFERRED_ROUTES, getActivePublicRoutes, getDocsRoutes } from "@/src/navigation/routes";

describe("route and navigation contract", () => {
  it("keeps docs visible in active public routes and defers pricing/blog", () => {
    const activeRoutes = getActivePublicRoutes();
    expect(activeRoutes).toContain("/");
    expect(activeRoutes).toContain("/docs");
    expect(activeRoutes).toContain("/about");
    expect(activeRoutes).toContain("/privacy");
    expect(activeRoutes).toContain("/cookies");
    for (const deferred of DEFERRED_ROUTES) {
      expect(activeRoutes).not.toContain(deferred);
    }
  });

  it("hides only the codegen docs route when docs/codegen flag is disabled", () => {
    expect(getDocsRoutes(false)).toContain(APP_ROUTES.docs);
    expect(getDocsRoutes(false)).not.toContain("/docs/codegen");
  });

  it("exposes codegen docs route when docs/codegen flag is enabled", () => {
    expect(getDocsRoutes(true)).toContain("/docs/codegen");
  });

  it("has route entry files for active public pages in both modes", () => {
    const cwd = process.cwd();
    const requiredDefaultPages = [
      path.join(cwd, "app/page.tsx"),
      path.join(cwd, "app/about/page.tsx"),
      path.join(cwd, "app/privacy/page.tsx"),
      path.join(cwd, "app/cookies/page.tsx"),
    ];
    const requiredDocsPages = [
      path.join(cwd, "app/docs/page.mdx"),
      path.join(cwd, "app/docs/getting-started/page.mdx"),
      path.join(cwd, "app/docs/operations/page.tsx"),
      path.join(cwd, "app/docs/sharing/page.mdx"),
      path.join(cwd, "app/docs/codegen/page.mdx"),
      path.join(cwd, "app/docs/troubleshooting/page.mdx"),
    ];

    for (const page of requiredDefaultPages) {
      expect(fs.existsSync(page)).toBe(true);
    }
    for (const page of requiredDocsPages) {
      expect(fs.existsSync(page)).toBe(true);
    }
  });
});
