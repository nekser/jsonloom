# Codegen

Per-operation templates live under `codegen/{javascript,typescript,python,php,go,jq}`. Shared helpers are in `codegen/utils`. The central generator (`codegen/generate.ts`) is imported by the UI to render code.

## jq Target
- Output contract: generator returns a jq filter pipeline (not a shell wrapper).
- The filter expects JSON input from stdin/file (`jq '<filter>' input.json`).
- Current jq support is partial:
  - supported baseline: `ExtractPath`, `SetPath`, `DeletePath`, `MapArray`, `FilterArray`, `SortArray`, `SliceArray`, `CountArray`, `StringReplace`, `TrimStrings`, `Add`, `Subtract`, `Multiply`, `Divide`;
  - unsupported operations are emitted as explicit `# TODO` jq comments with config context.
- `writeResultTo` is not auto-translated for jq yet.

Maintenance:
- After editing templates, run `pnpm lint` to verify types.
- To refresh operation docs JSON: `pnpm export:ops`.
