# Performance Guide

## Current Guardrails
- Source editor pipeline recomputation is debounced (`180ms`) to reduce main-thread churn while typing.
- Pipeline execution timing is tracked in store (`lastRunMs`, `avgRunMs`, `slow`).
- Result panel shows latest execution time and execution mode.

## Execution Modes
Set `NEXT_PUBLIC_PIPELINE_EXECUTION_MODE`:
- `main` (default): executes on main thread.
- `worker`: prototype mode that yields execution to the event loop and runs pipeline safely without blocking rapid typing; falls back to `main` outside browser runtime.

## Recommended Usage
- Keep source payloads under 5MB for smooth editing.
- Prefer stepwise pipelines (break very large transforms into smaller stages).
- Use `writeResultTo` to avoid excessive deep-path rewrites in multiple steps.

## Troubleshooting
- If UI feels slow, watch Result header timing (`ms`) after each change.
- If worker mode is enabled but unsupported by environment, the app auto-falls back to `main`.
- Run `pnpm check` after performance-related changes.
