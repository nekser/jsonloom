import type { JSONValue } from "../types/json";

type VarsMap = Record<string, JSONValue>;

type Ctx = {
  vars: VarsMap;
  computing: Set<string>; // for circular detection
};

let ctx: Ctx = {
  vars: Object.create(null) as VarsMap,
  computing: new Set<string>(),
};

export function resetVarContext() {
  ctx = { vars: Object.create(null) as VarsMap, computing: new Set<string>() };
}

export function setVar(name: string, value: JSONValue) {
  ctx.vars[name] = value;
}

export function getVar(name: string): JSONValue {
  if (ctx.computing.has(name)) {
    throw new Error(`Circular variable reference: ${name}`);
  }
  if (!(name in ctx.vars)) {
    throw new Error(`Variable not defined: ${name}`);
  }
  return ctx.vars[name];
}

export function beginComputingVar(name: string) {
  ctx.computing.add(name);
}

export function endComputingVar(name: string) {
  ctx.computing.delete(name);
}

export function getAllVars(): Readonly<VarsMap> {
  return ctx.vars;
}
