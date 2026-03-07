# React / Next.js Audit

## Findings

### P1 - Oversized operations panel module
- Previous `components/OperationsPanel.tsx` mixed list shell, operation card, nested editor recursion, mobile UX, and URL hydration.
- Risk: hard maintenance and high regression surface.
- Action taken: split into focused modules under `components/operations-panel/`.

### P1 - Duplicate Monaco theme observer logic
- `SourceEditor` and `ResultEditor` repeated DOM observer logic.
- Risk: drift and inconsistent behavior.
- Action taken: extracted `components/hooks/useEditorTheme.ts`.

### P1 - Broken landing CTA route
- Landing page linked to `/app`, but workspace route is `/free`.
- Action taken: updated CTA to `/free`.

### P2 - Scaffold metadata in layout
- App metadata still used default create-next-app values.
- Action taken: replaced with product metadata.

### P2 - Lint/test command mismatch
- Lint config required `@eslint/eslintrc` but dependency missing.
- README referenced `pnpm test` while package scripts lacked `test`.
- Action taken: added missing dependency and explicit test scripts (`test`, `test:unit`, `test:integration`, `test:coverage`).

## Recommended Next Improvements
1. Continue splitting nested editor recursion into smaller mode-specific components (`MapArray`, `If`, `Switch`) with shared nested-list primitives.
2. Add memoized selectors in Zustand usage to reduce avoidable re-renders in operation cards.
3. Add lightweight component tests for panel actions (enable/disable, reorder, delete) to guard UI regressions.
