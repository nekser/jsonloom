import fs from "node:fs";
import path from "node:path";

describe("operation helper wiring", () => {
  it("renders helper dialog in top-level and nested operation cards", () => {
    const cwd = process.cwd();
    const topLevelCard = fs.readFileSync(path.join(cwd, "components/operations-panel/OperationCard.tsx"), "utf8");
    const nestedCard = fs.readFileSync(path.join(cwd, "components/operations-panel/nested/NestedOperationCard.tsx"), "utf8");

    expect(topLevelCard).toContain("OperationHelperDialog");
    expect(topLevelCard).toContain("operationType={op.type as OperationType}");
    expect(nestedCard).toContain("OperationHelperDialog");
    expect(nestedCard).toContain("operationType={op.type}");
  });
});
