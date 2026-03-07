import fs from "node:fs";
import path from "node:path";
import { APP_ROUTES, DEFERRED_ROUTES, LANDING_NAV_LINKS } from "@/src/navigation/routes";

describe("route and navigation contract", () => {
  it("keeps only active public routes in nav and defers pricing/blog", () => {
    const hrefs = LANDING_NAV_LINKS.map((x) => x.href);
    expect(hrefs).toContain("#features");
    expect(hrefs).toContain(APP_ROUTES.docs);
    expect(hrefs).toContain(APP_ROUTES.about);
    for (const deferred of DEFERRED_ROUTES) {
      expect(hrefs).not.toContain(deferred);
    }
  });

  it("has route entry files for active public pages", () => {
    const cwd = process.cwd();
    const requiredPages = [
      path.join(cwd, "app/page.tsx"),
      path.join(cwd, "app/free/page.tsx"),
      path.join(cwd, "app/docs/page.tsx"),
      path.join(cwd, "app/about/page.tsx"),
    ];
    for (const page of requiredPages) {
      expect(fs.existsSync(page)).toBe(true);
    }
  });
});
