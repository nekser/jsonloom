# Architecture

## High-Level Flow
1. User edits source data and operation stack in UI.
2. Zustand store (`src/store/operations.ts`) updates state.
3. Store invokes pipeline runtime (`src/operations/pipelineRunner.ts`).
4. Runtime resolves configs, validates each operation, applies transforms.
5. Result and per-step intermediate snapshots are pushed back to UI.

## Subsystems
- UI: `app/` + `components/`
- Panel composition and nested editors: `components/operations-panel/`
- Runtime operations: `src/operations/`
- Sharing/import/export helpers: `src/utils/sharing/`, `src/importers/`, `src/exporters/`

## State Model (Store)
- `sourceText`, `sourceFormat`, `sourceError`
- `operations` (ordered stack)
- `resultText`, `pipelineError`
- `opIndexes`, `intermediate` for editor path suggestions and debug
- `past`/`future` for undo-redo

## Pipeline Lifecycle
- Parse source input by selected format.
- For each operation:
  - Resolve `${...}` templates against current scope.
  - Validate operation config against current data.
  - Apply operation.
  - Save intermediate output.
- Surface first validation/runtime error with operation id.
