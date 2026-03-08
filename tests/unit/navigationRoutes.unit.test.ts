import fs from "node:fs";
import path from "node:path";
import { APP_ROUTES, DEFERRED_ROUTES } from "@/src/navigation/routes";

describe("route and navigation contract", () => {
  it("keeps only active public routes and defers pricing/blog", () => {
    const activeRoutes = Object.values(APP_ROUTES);
    expect(activeRoutes).toContain("/");
    expect(activeRoutes).toContain("/docs");
    expect(activeRoutes).toContain("/about");
    for (const deferred of DEFERRED_ROUTES) {
      expect(activeRoutes).not.toContain(deferred);
    }
  });

  it("has route entry files for active public pages", () => {
    const cwd = process.cwd();
    const requiredPages = [
      path.join(cwd, "app/page.tsx"),
      path.join(cwd, "app/docs/page.mdx"),
      path.join(cwd, "app/docs/getting-started/page.mdx"),
      path.join(cwd, "app/docs/operations/page.tsx"),
      path.join(cwd, "app/docs/sharing/page.mdx"),
      path.join(cwd, "app/docs/codegen/page.mdx"),
      path.join(cwd, "app/docs/troubleshooting/page.mdx"),
      path.join(cwd, "app/about/page.tsx"),
    ];
    for (const page of requiredPages) {
      expect(fs.existsSync(page)).toBe(true);
    }
  });
});
