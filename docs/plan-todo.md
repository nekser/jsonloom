# Project Improvement Plan TODO

This document breaks down the identified improvements into actionable tasks. We can execute these sections one by one.

## 3) Add component tests for operations panel interactions
- Choose test stack for UI components (Jest + RTL baseline).
- Add tests for add, delete, enable/disable, reorder (desktop).
- Add tests for mobile actions sheet/dialog flows.
- Add tests for write-result input clear/edit behavior.
- Add tests for nested pipeline editor interactions.
- Integrate these tests into `pnpm check` workflow.
- Add Playwright E2E flows for core UI behavior on real browser runtime:
  - open `/free`, edit source, add operation, verify result updates;
  - reorder operations and verify output changes;
  - test import/export dialogs and pipeline share URL hydration;
  - validate mobile viewport operation actions.

## 5) Expand pipeline runner orchestration tests
- Add tests for unknown operation type handling.
- Add tests for disabled op behavior and intermediate state recording.
- Add tests for config resolution failures (`${...}` expression errors).
- Add tests for validation failure short-circuiting.
- Add tests for MapArray special config resolution path.
- Add tests for exception wrapping and returned `ValidationError` shape.

## 6) Increase coverage of low-tested shared operation utilities
- Prioritize modules: `objectUtils`, `sortUtils`, `sliceUtils`, `reduceUtils`, `groupUtils`.
- Add happy-path + edge-case tests per module.
- Add error-path and invalid-input tests.
- Add wildcard/path edge-case tests where relevant.
- Track per-module coverage progress and adjust thresholds gradually.
- Re-run full suite and update docs/testing guidance if needed.

## 7) Standardize operation validation patterns
- Define validation guidelines (schema-first + custom semantic checks).
- Document error message conventions (path/context/actionable text).
- Refactor operations with ad-hoc validation toward shared pattern.
- Add shared helpers for common validation checks.
- Add tests asserting consistent error messaging format.
- Update operations documentation with the standardized approach.

## 8) Add CI quality gate for `pnpm check`
- Add CI workflow file (GitHub Actions or equivalent).
- Configure Node/pnpm setup and dependency caching.
- Run `pnpm install` and `pnpm check` on pull requests.
- Add Playwright install/cache steps and run browser E2E in CI.
- Publish Playwright HTML report/artifacts on failure.
- Add branch protection requirement for CI status.
- Add badge/status reference in README (optional).
- Document CI workflow in `docs/testing.md`.

## 11) Add Playwright E2E test pipeline
- Install Playwright and initialize test project structure.
- Add `e2e/` specs for primary user flows (`/free` editor workflow + pipeline operations UX).
- Add stable selectors/test IDs for flaky UI targets (drag handles, dialogs, editor actions).
- Add Playwright config for Chromium baseline and optional mobile project.
- Add scripts:
  - `test:ui` (headed/headless local run),
  - `test:ui:ci` (CI-safe run with retries/reporters).
- Integrate `test:ui:ci` into `pnpm check` once test runtime is stable.
- Document local Playwright setup and troubleshooting in `docs/testing.md`.

## Execution Notes
- Execute sections sequentially to reduce risk.
- Keep each section as a small PR-sized change set.
- Run `pnpm check` after each section.

## Completed
- [x] 1) Split `NestedPipelineEditors` into smaller modules.
- [x] 2) Optimize Zustand selector usage and re-renders.
- [x] 9) Resolve header links and route consistency.
- [x] 4) Reduce `unknown` casts with stronger runtime typings.
- [x] 10) Add performance guardrails for large JSON payloads.
- [x] 12) Add `jq` code generator.
