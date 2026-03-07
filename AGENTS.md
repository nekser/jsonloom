# AGENTS.md

## Purpose
This repository is a client-side JSON transformation web tool built with Next.js App Router, React, and Zustand. Users compose operation pipelines and preview results live.

## Architecture Map
- UI shell: `app/`, `components/`
- Pipeline state and orchestration: `src/store/operations.ts`
- Transformation runtime: `src/operations/`
- Import/export and sharing: `src/importers/`, `src/exporters/`, `src/utils/sharing/`
- Tests: `tests/e2e/` (integration-style), `tests/unit/` (runtime/unit)

## Core Commands
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Lint: `pnpm lint`
- Unit tests: `pnpm test:unit`
- Integration tests: `pnpm test:integration`
- Full tests: `pnpm test`
- Coverage: `pnpm test:coverage`
- Quality gate (lint + unit + integration): `pnpm check`
- Export operation metadata: `pnpm run export:ops`

## Safe Edit Rules
- Do not run destructive git commands (`reset --hard`, forced checkout) unless explicitly requested.
- Keep operation behavior backward-compatible unless fixing a confirmed bug.
- Prefer small, focused modules over large multipurpose files.
- When adding or changing operations, update docs and tests in the same change.

## Agent Guardrails
- Validate behavior with tests after code changes.
- For UI refactors, preserve existing interaction behavior and keyboard/mouse drag flows.
- For runtime changes, add/adjust unit tests in `tests/unit` and keep relevant integration tests green.
- Keep path handling and `writeResultTo` semantics consistent across operations.

## Testing Workflow
1. Run targeted unit tests first for changed runtime modules.
2. Run integration tests covering affected operations.
3. Run coverage command for regression check when touching shared runtime utilities.

## Where to Add New Work
- New operation implementation: `src/operations/<Operation>.ts`
- Register operation: `src/operations/index.ts` and operation metadata export flow
- UI editor controls: `components/opEditors/`
- Operation panel behavior: `components/operations-panel/`
- Runtime tests: `tests/unit/`
- Integration scenarios: `tests/e2e/`

## PR Checklist
- Code compiles and lint passes.
- New/changed behavior has tests.
- Docs updated (`docs/` and/or `README.md`) for user-facing or contributor-facing changes.
- No unrelated file churn.

## Definition of Done
- Implementation matches requested behavior.
- Tests pass for affected areas.
- Coverage impact is acceptable for touched runtime modules.
- Documentation is updated for humans and AI agents.
