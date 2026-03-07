import { applyOperation } from "@/tests/helpers/runner";

describe("MapArray (unit)", () => {
  it("skips failing elements when onError=skip", () => {
    const input = { items: [{ n: 2 }, { n: "x" }, { n: 3 }] };
    const op = {
      type: "MapArray" as const,
      config: {
        path: "items",
        onError: "skip",
        operations: [{ id: "mul", type: "Multiply", config: { path: "n", value: 2 } }],
      },
    };

    const result = applyOperation(input, op);
    expect(result).toEqual({ items: [{ n: 4 }, { n: 6 }] });
  });

  it("supports writeResultTo", () => {
    const input = { items: [{ n: 1 }, { n: 2 }] };
    const op = {
      type: "MapArray" as const,
      config: {
        path: "items",
        operations: [{ id: "mul", type: "Multiply", config: { path: "n", value: 2 } }],
        writeResultTo: "_internal.itemsDoubled",
      },
    };

    const result = applyOperation(input, op);
    expect(result).toEqual({ items: [{ n: 1 }, { n: 2 }], _internal: { itemsDoubled: [{ n: 2 }, { n: 4 }] } });
  });
});
