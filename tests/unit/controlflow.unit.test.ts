import { applyOperation } from "@/tests/helpers/runner";

describe("If/Switch (unit)", () => {
  it("runs then branch for If", () => {
    const input = { flag: true, out: 1 };
    const op = {
      type: "If" as const,
      config: {
        when: { path: "flag", op: "eq", value: true },
        then: [{ id: "add", type: "Add", config: { path: "out", value: 2 } }],
        else: [{ id: "sub", type: "Subtract", config: { path: "out", value: 1 } }],
      },
    };
    expect(applyOperation(input, op)).toEqual({ flag: true, out: 3 });
  });

  it("uses matching case for Switch", () => {
    const input = { status: "paid", amount: 10 };
    const op = {
      type: "Switch" as const,
      config: {
        path: "status",
        cases: [{ value: "paid", ops: [{ id: "mul", type: "Multiply", config: { path: "amount", value: 2 } }] }],
        default: [{ id: "noop", type: "Add", config: { path: "amount", value: 0 } }],
      },
    };

    expect(applyOperation(input, op)).toEqual({ status: "paid", amount: 20 });
  });
});
