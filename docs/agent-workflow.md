# Agent Workflow

This project uses an agent-first development workflow with clear ownership and quality gates.

## 1. Ticket Intake
- Start from one item in `docs/plan-todo.md`.
- Define acceptance criteria before implementation.
- Keep scope narrow (single subsection-sized change).

## 2. Agent Roles
- Agent A (Implementer): code changes only.
- Agent B (Test Engineer): adds/updates tests, expands edge cases.
- Agent C (Docs Maintainer): updates docs/AGENTS/readme.
- Agent D (Reviewer): risk-focused review, no code edits.

## 3. Branch + PR Strategy
- One concern per PR.
- PR title format: `<area>: <outcome>`.
- Link the exact `plan-todo` section in PR body.

## 4. Required Local Gate
Before opening PR, run:
```bash
pnpm check
pnpm check:dev
```
When Playwright is enabled, include:
```bash
pnpm test:ui:ci
```

For route-scoped changes, you may run affected-page smoke checks:
```bash
ROUTES="/about" pnpm check:dev
```

## 5. Agent Output Contract
Each agent deliverable must include:
- files changed
- behavior changes
- tests added/updated
- known risks or gaps
- follow-up tasks (if any)

## 6. Human Decision Points
Humans approve:
- architecture-level tradeoffs
- UX/product decisions
- breaking behavior changes

Agents should proceed autonomously on implementation details inside accepted scope.

## 7. Definition of Done
- Acceptance criteria satisfied.
- Lint/tests pass (`pnpm check`).
- Docs updated for changed behavior.
- Review findings resolved or explicitly tracked.
- Implementation is finalized with `git commit` and `git push` for each fix or feature.

## 8. Iteration Loop
1. Pick next `plan-todo` item.
2. Implement with Agent A.
3. Validate with Agent B.
4. Update docs with Agent C.
5. Risk-review with Agent D.
6. Merge and move to next item.

## 9. Git Finalization Rule
- Every fix or feature must end with a commit and push to the active branch.
- Do not leave validated code changes uncommitted.
