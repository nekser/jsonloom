# Testing

## Test Layers
- Unit/runtime tests: `tests/unit/`
  - Focus: pure helpers, config resolution, operation edge cases, pipeline runner behavior.
- Integration-style pipeline tests: `tests/e2e/`
  - Focus: operation behavior through runner with realistic configs.

## Commands
- Unit: `pnpm test:unit`
- Integration: `pnpm test:integration`
- Combined: `pnpm test`
- Coverage: `pnpm test:coverage`
- Dev route smoke: `pnpm check:dev`

`pnpm check:dev` boots the dev server and checks that routes return non-500 responses.
- Default routes: `/`, `/docs`, `/about`
- Affected-routes run: `ROUTES=\"/docs,/docs/operations\" pnpm check:dev`

## Performance Execution Mode
- Default: main-thread execution.
- Optional worker prototype:
  - `NEXT_PUBLIC_PIPELINE_EXECUTION_MODE=worker`
  - App runs a non-blocking prototype mode in browser and falls back safely to main-thread mode outside browser runtime.

## Coverage Strategy
Risk-based baseline:
- Prioritize shared runtime utilities and complex operations.
- Add stricter thresholds incrementally for high-risk modules.
- Avoid unstable hard global thresholds while expanding baseline tests.

## What to Test for New Runtime Changes
- Happy path behavior
- Validation failures
- Error handling modes (`propagate` vs `skip` where applicable)
- `writeResultTo` routing behavior
- Config interpolation (`${...}`) resolution
