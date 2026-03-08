import { operationHelperByType } from "@/src/docs/operation-helpers";
import { operationCatalog } from "@/src/operations/operationRegistry";

describe("operation helper coverage", () => {
  it("has one helper entry per operation type", () => {
    for (const op of operationCatalog) {
      expect(operationHelperByType[op.type]).toBeDefined();
    }
  });

  it("ensures required helper fields are populated", () => {
    for (const op of operationCatalog) {
      const entry = operationHelperByType[op.type];
      expect(entry.excerpt.trim().length).toBeGreaterThan(0);
      expect(entry.configFields.length).toBeGreaterThan(0);
      expect(entry.configFields[0]?.label.trim().length).toBeGreaterThan(0);
      expect(entry.configFields[0]?.value.trim().length).toBeGreaterThan(0);
      expect(entry.outputExample.trim().length).toBeGreaterThan(0);
    }
  });
});
