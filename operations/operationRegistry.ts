import type { OperationType } from "./types";

export type OperationCategory = "Object" | "Array" | "String" | "Other";

export interface OperationMeta {
  type: OperationType;
  category: OperationCategory;
  label: string;
  description: string;
  // Optional: form component for rendering this operation's config UI
  // Lazy-load later to optimize bundle size
  component?: React.ComponentType<any>;
}

export const operationCatalog: OperationMeta[] = [
  // Object
  {
    type: "FilterByKey",
    category: "Object",
    label: "Filter By Key",
    description: "Keep or remove object keys by name",
  },
  {
    type: "RenameKey",
    category: "Object",
    label: "Rename Key",
    description: "Rename a key recursively",
  },
  {
    type: "ExtractPath",
    category: "Object",
    label: "Extract Path",
    description: "Extract a nested value by path",
  },
  { type: "RenameKeysByPattern", category: "Object", label: "Rename Keys by Pattern", description: "Regex-based key renaming recursively" },
  { type: "NormalizeKeyCase", category: "Object", label: "Normalize Key Case", description: "Convert all keys to camel/snake/kebab/pascal" },
  { type: "PickPaths", category: "Object", label: "Pick Paths", description: "Return new object with only specified paths" },
  { type: "OmitPaths", category: "Object", label: "Omit Paths", description: "Remove properties at specified paths" },
  { type: "SetPath", category: "Object", label: "Set Path", description: "Set or overwrite value at a path" },
  { type: "DeletePath", category: "Object", label: "Delete Path", description: "Delete property at path" },
  { type: "MergeAtPath", category: "Object", label: "Merge At Path", description: "Merge target object with source (shallow/deep/overwrite)" },
  { type: "FlattenObject", category: "Object", label: "Flatten Object", description: "Flatten nested object into dotted keys" },
  { type: "UnflattenObject", category: "Object", label: "Unflatten Object", description: "Expand dotted keys into nested object" },

  // Array
  {
    type: "MapArray",
    category: "Array",
    label: "Map Array",
    description: "Map an array at a JSON path (type cast)",
  },
  { type: "FilterArray", category: "Array", label: "Filter Array", description: "Filter items in an array by a condition" },
  { type: "SortArray", category: "Array", label: "Sort Array", description: "Sort an array by value or key" },
  { type: "UniqueArray", category: "Array", label: "Unique Array", description: "Remove duplicates from an array" },
  { type: "FlattenArray", category: "Array", label: "Flatten Array", description: "Flatten nested arrays to a given depth" },
  { type: "SliceArray", category: "Array", label: "Slice Array", description: "Slice an array by start/end/step" },
  { type: "GroupBy", category: "Array", label: "Group By", description: "Group objects in an array by a key" },
  { type: "ReduceArray", category: "Array", label: "Reduce Array", description: "Reduce an array (sum/avg/min/max/concat)" },
  { type: "CountArray", category: "Array", label: "Count Array", description: "Replace an array with its length" },
  { type: "JoinArray", category: "Array", label: "Join Array", description: "Join array items into a string" },

  // String
  { type: "StringReplace", category: "String", label: "String Replace", description: "Replace text within string values" },
  { type: "RegexReplace", category: "String", label: "Regex Replace", description: "Regex-based string replace with flags" },
  { type: "TrimStrings", category: "String", label: "Trim Strings", description: "Trim whitespace (global or at path)" },
  { type: "CoerceType", category: "String", label: "Coerce Type", description: "Convert value to string/number/boolean/object/array" },
  { type: "TemplateInterpolate", category: "String", label: "Template Interpolate", description: "Interpolate ${...} placeholders from root" },
  { type: "Base64", category: "String", label: "Base64", description: "Encode or decode Base64" },
  { type: "StringCase", category: "String", label: "String Case", description: "Convert to lower/upper case" },
];

export const operationMetaByType: Record<OperationType, OperationMeta> = Object.fromEntries(
  operationCatalog.map((m) => [m.type, m])
) as Record<OperationType, OperationMeta>;
