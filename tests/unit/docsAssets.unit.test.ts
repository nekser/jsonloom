import fs from "node:fs";
import path from "node:path";
import { docsScreenshots } from "@/src/docs/screenshots";

describe("docs assets", () => {
  it("references existing screenshot files", () => {
    const cwd = process.cwd();
    for (const shot of docsScreenshots) {
      const rel = shot.src.startsWith("/") ? shot.src.slice(1) : shot.src;
      expect(fs.existsSync(path.join(cwd, "public", rel.replace(/^public\//, "")))).toBe(true);
      expect(shot.caption.length).toBeGreaterThan(10);
    }
  });
});
