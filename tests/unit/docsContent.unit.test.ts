import fs from "node:fs";
import path from "node:path";

describe("docs content wiring", () => {
  it("renders operation cards with use case and examples", () => {
    const cwd = process.cwd();
    const operationCard = fs.readFileSync(path.join(cwd, "components/docs/OperationCard.tsx"), "utf8");
    const operationsPage = fs.readFileSync(path.join(cwd, "app/docs/operations/page.tsx"), "utf8");
    expect(operationCard).not.toContain(">Use case<");
    expect(operationCard).toContain("ExamplePair");
    expect(operationsPage).toContain("OperationCard");
  });

  it("keeps docs cross-links to home and about routes", () => {
    const cwd = process.cwd();
    const docsIndex = fs.readFileSync(path.join(cwd, "app/docs/page.mdx"), "utf8");
    expect(docsIndex).toContain("pipeline in `/`");
    expect(docsIndex).toContain("/about");
    expect(docsIndex).not.toContain("code generation");
  });
});
