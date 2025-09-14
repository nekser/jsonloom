/*
  Export a JSON with all operations, their names, parameters (required/optional), and a short description.
  Heuristics:
  - Reads src/operations/index.ts to discover modules.
  - Parses each operation file for Ajv `required: [..]` and `defaultConfig: { ... }` keys.
  - Uses a built-in description map; falls back to a generic phrase.
  Output: writes app/operations.json
*/

import { promises as fs } from "node:fs";
import path from "node:path";

type OperationMeta = {
  type: string;
  name: string;
  description: string;
  parameters: { required: string[]; optional: string[] };
};

const root = path.resolve(process.cwd());
// Source operations live under src/operations in this project
const opsDir = path.join(root, "src", "operations");
const opsIndex = path.join(opsDir, "index.ts");
const outPath = path.join(root, "operations.json");

const DESCRIPTIONS: Record<string, string> = {
  // Arrays
  MapArray: "Apply a sequence of operations to each item of an array at a path.",
  FilterArray: "Filter array items by a condition.",
  SortArray: "Sort array items by key or expression.",
  UniqueArray: "Remove duplicate items from an array.",
  FlattenArray: "Flatten nested arrays into a single-level array.",
  SliceArray: "Take a slice of an array by start/end.",
  GroupBy: "Group array items by a key.",
  ReduceArray: "Reduce an array to a single value using an accumulator.",
  CountArray: "Count items in an array, optionally by condition.",
  JoinArray: "Join array items into a string using a separator.",

  // Objects / Paths
  ExtractPath: "Extract value from a JSON path.",
  PickPaths: "Pick only specified paths from an object.",
  OmitPaths: "Remove specified paths from an object.",
  SetPath: "Set a value at a JSON path (create or overwrite).",
  DeletePath: "Delete a value at a JSON path.",
  MergeAtPath: "Deep-merge an object at a JSON path.",
  FlattenObject: "Flatten nested object keys using dot paths.",
  UnflattenObject: "Expand dot-path keys into a nested object.",
  FilterByKey: "Filter object entries by key.",
  RenameKey: "Rename a single object key.",
  RenameKeysByPattern: "Rename keys using a search pattern.",
  NormalizeKeyCase: "Normalize object key casing (e.g., camel, snake).",

  // Strings
  StringReplace: "Replace substrings in a string using a simple pattern.",
  RegexReplace: "Replace text using a regular expression.",
  TrimStrings: "Trim whitespace from strings.",
  StringCase: "Change string case (upper, lower, title, etc.).",
  TemplateInterpolate: "Interpolate template strings with values from JSON.",
  Base64: "Encode or decode Base64 strings.",

  // Math / Numbers
  Add: "Add a number to a value at a path.",
  Subtract: "Subtract a number from a value at a path.",
  Multiply: "Multiply a number at a path.",
  Divide: "Divide a number at a path.",
  Modulo: "Apply modulo to a number at a path.",
  Power: "Raise a number at a path to a power.",
  Round: "Round a number to a specified precision.",
  Clamp: "Clamp a number between min and max.",
  Sum: "Sum numeric values from an array or object.",
  Count: "Count items (e.g., array length).",
  Min: "Compute the minimum value.",
  Max: "Compute the maximum value.",

  // Control flow
  If: "Conditionally apply different operation branches.",
  Switch: "Apply operations based on a matching case value.",
  SetVariable: "Compute a value via a nested operation and store it as a variable.",

  // Validation / Dates
  ValidateJSON: "Validate JSON against a schema or checks.",
  ParseDate: "Parse a string into a date/time value.",
  IsDateCompare: "Compare two dates/times with an operator.",
  DateAdd: "Add a duration to a date/time.",
  DateDiff: "Calculate the difference between two dates/times.",
};

function uniqueStrings(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function parseRequiredFromAjvSource(source: string): string[] {
  // Match required: ["a", "b"] inside Ajv compile object
  const m = source.match(/required\s*:\s*\[([\s\S]*?)\]/);
  if (!m) return [];
  const body = m[1];
  const names = Array.from(body.matchAll(/"([^"]+)"|'([^']+)'/g)).map((g) => g[1] || g[2]);
  return uniqueStrings(names);
}

function parseDefaultConfigKeys(source: string): string[] {
  const m = source.match(/defaultConfig\s*:\s*\{([\s\S]*?)\}/);
  if (!m) return [];
  const objBody = m[1];
  // capture keys like: key: value,
  const keys = Array.from(objBody.matchAll(/([A-Za-z0-9_-]+)\s*:/g)).map((g) => g[1]);
  return uniqueStrings(keys);
}

async function readIndexImports() {
  const text = await fs.readFile(opsIndex, "utf8");
  // import Foo from "./Foo"; -> { name: Foo, file: Foo }
  const matches = Array.from(text.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+"\.\/([A-Za-z0-9_]+)"/g));
  return matches.map((m) => ({ ident: m[1], file: m[2], type: m[2] }));
}

async function build(): Promise<{ operations: OperationMeta[] }> {
  const imports = await readIndexImports();
  const out: OperationMeta[] = [];

  for (const imp of imports) {
    // Skip the index itself; we already filtered by pattern
    const filePathTs = path.join(opsDir, `${imp.file}.ts`);
    const filePathTsx = path.join(opsDir, `${imp.file}.tsx`);
    const filePathJs = path.join(opsDir, `${imp.file}.js`);
    const filePath = (await exists(filePathTs))
      ? filePathTs
      : (await exists(filePathTsx))
      ? filePathTsx
      : filePathJs;

    const text = await fs.readFile(filePath, "utf8");
    const required = parseRequiredFromAjvSource(text);
    const defaults = parseDefaultConfigKeys(text);
    const optional = defaults.filter((k) => !required.includes(k));

    const type = imp.type;
    const name = type;
    const description = DESCRIPTIONS[type] || `Perform the ${type} transformation.`;

    out.push({
      type,
      name,
      description,
      parameters: { required, optional },
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return { operations: out };
}

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const data = await build();
  await fs.writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outPath}`);
})();
