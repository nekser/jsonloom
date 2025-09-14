import MapArrayMod from "../src/operations/MapArray";
import TemplateInterpolateMod from "../src/operations/TemplateInterpolate";
import type { Operation } from "../src/operations/types";
import { getOperationModule } from "../src/operations";
import { resolveConfig } from "../src/operations/configResolver";

const input = {
  users: [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Lee", email: "bob@example.com" },
  ],
};

const ops: Operation[] = [
  {
    id: "map1",
    type: "MapArray",
    config: {
      path: "users",
      operations: [
        {
          id: "tmpl",
          type: "TemplateInterpolate",
          config: {
            path: "summary",
            template: "${name} <${email}>",
            onMissing: "error",
          },
        },
      ],
    },
  },
];

function debugResolveNested() {
  const el = input.users[0];
  const nested = (ops[0].config as any).operations[0];
  const effective = nested.config;
  const resolved = resolveConfig(effective, { root: input as any, current: el as any });
  console.log("resolved nested config:", resolved);
  const direct = TemplateInterpolateMod.apply(el as any, resolved as any);
  console.log("direct TI on el:", JSON.stringify(direct, null, 2));
}

function runAll(inputObj: any, ops: Operation[]) {
  let cur = inputObj;
  for (const op of ops) {
    const mod = getOperationModule(op.type);
    let cfg: any;
    if (op.type === "MapArray" && op.config && typeof op.config === "object") {
      const { operations, ...rest } = op.config as any;
      cfg = { ...resolveConfig(rest, { root: inputObj }), operations };
    } else {
      cfg = resolveConfig(op.config as any, { root: inputObj });
    }
    const err = mod.validate(cfg as any, cur);
    if (err) throw new Error(err);
    cur = mod.apply(cur, cfg as any);
  }
  return cur;
}

(async () => {
  debugResolveNested();
  const out = runAll(input, ops);
  console.log(JSON.stringify(out, null, 2));
})();
