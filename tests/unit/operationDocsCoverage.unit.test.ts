import { operationCatalog } from "@/src/operations/operationRegistry";
import { operationDocs } from "@/src/docs/operations-content";

describe("operation docs coverage", () => {
  it("has one docs entry per operation type", () => {
    const types = operationCatalog.map((o) => o.type);
    for (const type of types) {
      expect(operationDocs[type]).toBeDefined();
    }
  });

  it("ensures required docs fields are populated", () => {
    for (const op of operationCatalog) {
      const entry = operationDocs[op.type];
      expect(entry.type).toBe(op.type);
      expect(entry.useCase.trim().length).toBeGreaterThan(15);
      expect(entry.inputExample.trim().length).toBeGreaterThan(10);
      expect(entry.configExample.trim().length).toBeGreaterThan(10);
      expect(entry.outputExample.trim().length).toBeGreaterThan(0);
      expect(entry.notes.trim().length).toBeGreaterThan(10);
      expect(entry.demoLink.startsWith("/free?pipeline=")).toBe(true);
      expect(entry.demoLink.includes("&data=")).toBe(true);
    }
  });
});
