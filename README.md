## JSON Transformation Tool

Interactive, in-browser JSON transformation workspace (Next.js App Router) with:

- Three-column layout: Source | Operations Stack | Result
- Rich set of operations (filter, map, math, dates, coercion, string/regex, structural path edits, aggregation, conditionals, etc.)
- Draggable reordering, deletion, undo/redo (UI state)
- Live result evaluation with per-op validation
- JSON/YAML/CSV import & JSON/YAML export
- Code generation scaffolding (multi-language) for pipelines

All execution is client-side. No network calls or persistence/auth.

---

## Development

1. Install deps: `pnpm install`
2. Run dev server: `pnpm dev`
3. Run tests:
   - `pnpm test:unit` (runtime/unit)
   - `pnpm test:integration` (pipeline integration suites)
   - `pnpm test` (all tests)
4. Run project quality gate: `pnpm check`

### Operations metadata export

Generate a JSON listing of all operations, their parameters, and descriptions:

```bash
pnpm run export:ops
```

Output file: `app/operations.json`

---

## Unified result routing (writeResultTo)

Formerly, intermediate values in a pipeline were produced via a dedicated `SetVariable` operation. This has been removed in favor of a universal optional parameter `writeResultTo` available on (almost) every operation.

### Rationale

- Reduces cognitive load (no special op just to capture a value)
- Avoids a mutable variable store – everything is now explicit JSON path writes
- Enables capturing intermediate results without overwriting the primary mutation target
- Simplifies code generation & schema docs

### Semantics

When an operation runs it typically produces a mutated root object (e.g. updating a field). If `writeResultTo` is omitted, that mutated root becomes the new pipeline state. If `writeResultTo` is provided, the meaningful computed value of the operation is written to the given JSON path on the ORIGINAL input snapshot while still returning the normal mutated root for downstream steps.

This means you can both:

1. Perform the structural/data change the op normally does, and
2. Stash (or redirect) the derived value somewhere else for reuse.

### Example

Instead of:

```jsonc
// (legacy) Parse then SetVariable then DateAdd using that variable
[
	{ "type": "ParseDate", "config": { "path": "start", "format": "YYYY-MM-DD" } },
	{ "type": "SetVariable", "config": { "name": "parsed", "path": "start" } },
	{ "type": "DateAdd", "config": { "path": "start", "amount": 5, "unit": "days" } }
]
```

Now:

```jsonc
[
	{ "type": "ParseDate", "config": { "path": "start", "format": "YYYY-MM-DD", "writeResultTo": "_internal.startISO" } },
	{ "type": "DateAdd", "config": { "path": "_internal.startISO", "amount": 5, "unit": "days", "writeResultTo": "_internal.plus5" } },
	{ "type": "DateDiff", "config": { "startPath": "_internal.plus5", "endPath": "end", "unit": "days", "writeResultTo": "_internal.remaining" } }
]
```

### Internal namespace convention

Use a reserved-ish top-level key like `_internal` (as done in tests) to collect ephemeral intermediate values. This keeps the result transparent while avoiding collisions with real business fields.

### Migration guide (SetVariable → writeResultTo)

| Scenario | Before (SetVariable) | After (writeResultTo) |
|----------|----------------------|------------------------|
| Capture extracted path value | ExtractPath -> SetVariable | ExtractPath with `writeResultTo` pointing at `_internal.someValue` |
| Branch logic reference | Switch writes variable | Switch writes directly to a path via its own `writeResultTo` (or follow with SetPath if op lacks it) |
| Aggregate then reuse | ReduceArray -> SetVariable sum | ReduceArray with `writeResultTo: '_internal.sum'` |

### Runner behavior change

The test/evaluation runner now resolves `${}` expressions against the evolving pipeline state (current root) instead of the original input. This enables chaining newly written `_internal.*` paths immediately in subsequent operation configs.

---

## Code Generation

`src/codegen` contains language-specific templates. The registry was updated to exclude the removed `SetVariable` op; all ops expose `writeResultTo` in the metadata so generators can surface the parameter uniformly.

---

## Testing

- Unit/runtime suites: `pnpm test:unit`
- Integration pipeline suites: `pnpm test:integration`
- Combined run: `pnpm test`
- Coverage report: `pnpm test:coverage`
- Example combination tests show canonical patterns for capturing intermediate results using `_internal` paths.

---

## Future Enhancements (Ideas)

- Graph-like visualization of data dependencies (paths referenced by later ops)
- Inline profiling (timings per op)
- Schema-aware autocomplete for paths (JSON Pointer / JMESPath hybrid)
- Optional persistence layer for saved pipelines

---

## License

MVP / internal prototype (add license information here if open-sourcing).
