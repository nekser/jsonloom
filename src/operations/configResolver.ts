import type { JSONValue } from "../types/json";
import { getVar, getAllVars } from "./varContext";

// Basic path reader from a root object; supports dot paths without brackets
function readPath(root: unknown, path: string): unknown {
  if (path === "" || path === "." || root == null) return root as unknown;
  return path.split(".").reduce<unknown>((acc, seg) => {
    if (acc == null) return undefined;
    if (typeof acc === "object" && !Array.isArray(acc)) return (acc as Record<string, unknown>)[seg];
    if (Array.isArray(acc)) return (acc as unknown as Record<string, unknown>)[seg];
    return undefined;
  }, root);
}

const TEMPLATE_RE = /\$\{([^}]+)\}/g; // ${expr}

function evalExpr(expr: string, scope: { root: JSONValue; current?: JSONValue }): unknown {
  // Supported identifiers:
  // - vars.<name>  -> variable store
  // - current.*    -> current context (when provided)
  // - root.*       -> full input root
  // - numbers, + - * / ( ) and whitespace
  // We do NOT use eval; we implement a very tiny evaluator for infix arithmetic with variable lookups.
  // To keep it minimal, we only support literals, identifiers with dot access, and arithmetic ops.

  // Tokenize
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/[\s]/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push(expr.slice(i, j));
      i = j;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[A-Za-z0-9_.$]/.test(expr[j])) j++;
      tokens.push(expr.slice(i, j));
      i = j;
      continue;
    }
    if (/[()+\-*/]/.test(ch)) { tokens.push(ch); i++; continue; }
    // Unknown char -> bail
    throw new Error(`Unsupported character in expression: '${ch}'`);
  }

  // Shunting-yard to RPN then evaluate
  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const output: string[] = [];
  const ops: string[] = [];
  for (const t of tokens) {
    if (/^[0-9.]+$/.test(t) || /^[A-Za-z_$][A-Za-z0-9_.$]*$/.test(t)) {
      output.push(t);
    } else if (t in prec) {
      while (ops.length && ops[ops.length - 1] in prec && prec[ops[ops.length - 1]] >= prec[t]) {
        output.push(ops.pop()!);
      }
      ops.push(t);
    } else if (t === "(") {
      ops.push(t);
    } else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") output.push(ops.pop()!);
      if (ops.pop() !== "(") throw new Error("Mismatched parentheses");
    } else {
      throw new Error(`Unsupported token: ${t}`);
    }
  }
  while (ops.length) output.push(ops.pop()!);

  function resolveIdentifier(id: string): unknown {
    if (id === "true") return true;
    if (id === "false") return false;
    if (id === "null") return null;
    if (id === "undefined") return undefined;
    // vars.foo
    if (id.startsWith("vars.") || id.startsWith("$vars.")) {
      const name = id.replace(/^\$?vars\./, "");
      return getVar(name);
    }
    if (id.startsWith("root.")) return readPath(scope.root, id.slice(5));
    if (id === "root") return scope.root;
    if (id.startsWith("current.")) return readPath(scope.current as unknown, id.slice(8));
    if (id === "current") return scope.current;
    // plain identifier -> prefer current item scope (array-level), then vars, then root
    if (scope.current !== undefined) {
      const v = readPath(scope.current as unknown, id);
      if (v !== undefined) return v;
    }
    const vm = getAllVars();
    if (Object.prototype.hasOwnProperty.call(vm, id)) return vm[id];
    return readPath(scope.root, id);
  }

  const stack: unknown[] = [];
  for (const t of output) {
    if (/^[0-9.]+$/.test(t)) stack.push(parseFloat(t));
    else if (/^[A-Za-z_$][A-Za-z0-9_.$]*$/.test(t)) stack.push(resolveIdentifier(t));
    else if (t === "+" || t === "-" || t === "*" || t === "/") {
      const b = stack.pop() as unknown;
      const a = stack.pop() as unknown;
      const an = Number(a as number);
      const bn = Number(b as number);
      if (!Number.isFinite(an) || !Number.isFinite(bn)) throw new Error("Non-numeric expression operands");
      switch (t) {
        case "+": stack.push(an + bn); break;
        case "-": stack.push(an - bn); break;
        case "*": stack.push(an * bn); break;
        case "/": stack.push(an / bn); break;
      }
    } else {
      throw new Error(`Unsupported RPN token: ${t}`);
    }
  }
  if (stack.length !== 1) throw new Error("Invalid expression");
  return stack[0];
}

function resolveValue(value: unknown, scope: { root: JSONValue; current?: JSONValue }): unknown {
  // Direct variable reference used as value: $vars.name
  if (typeof value === "string" && value.startsWith("$vars.")) {
    const name = value.slice("$vars.".length);
    return getVar(name);
  }
  // String template interpolation: "... ${ ... } ..."
  if (typeof value === "string" && value.includes("${")) {
    return value.replace(TEMPLATE_RE, (_, expr: string) => {
      const v = evalExpr(String(expr).trim(), scope);
      return String(v);
    });
  }
  // Recurse into objects and arrays
  if (Array.isArray(value)) return value.map((v) => resolveValue(v, scope)) as unknown[];
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveValue(v, scope);
    }
    return out;
  }
  return value;
}

export function resolveConfig<T = unknown>(config: T, scope: { root: JSONValue; current?: JSONValue }): T {
  return resolveValue(config as unknown, scope) as T;
}
