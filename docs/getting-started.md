# Getting Started

## Prerequisites
- Node.js 20+
- pnpm 9+

## Setup
1. `pnpm install`
2. `pnpm dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Common Commands
- Lint: `pnpm lint`
- Unit tests: `pnpm test:unit`
- Integration tests: `pnpm test:integration`
- Full test run: `pnpm test`
- Coverage: `pnpm test:coverage`
- Export operations metadata: `pnpm run export:ops`

## Typical Workflow
1. Implement runtime or UI change.
2. Add/update tests for affected behavior.
3. Run unit tests for touched runtime modules.
4. Run integration tests for affected operations.
5. Run lint.

## Notes
- Pipeline execution is client-side.
- The `/` route is the main transformation workspace.
