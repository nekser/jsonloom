# Codegen

Per-operation templates live under `codegen/{javascript,python,php}`. Shared helpers are in `codegen/utils`. The central generator (`codegen/generate.ts`) is imported by the UI to render code.

Maintenance:
- After editing templates, run `pnpm lint` to verify types.
- To refresh operation docs JSON: `pnpm export:ops`.
