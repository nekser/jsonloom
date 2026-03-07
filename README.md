# JSON Transformation Tool

Visual, browser-based workspace for transforming structured data with operation pipelines.

The app lets you:
- Load source data (`JSON`, `YAML`, `CSV`)
- Build ordered transformation pipelines
- Preview results live after each change
- Share reproducible pipelines via URL
- Generate code for multiple languages from a pipeline

Primary app route: `/free`  
Documentation route: `/docs`

## What It Is

This is a Next.js App Router application focused on interactive data transformation.

Core model:
- Input data + ordered operations => transformed output
- Operations are typed and validated
- Runtime executes client-side with error reporting and per-step metadata

## Current Feature Set

- Rich operation catalog across object, array, string, math, control flow, validation, and date categories
- Nested pipelines for advanced operations (`MapArray`, `If`, `Switch`)
- Undo/redo for pipeline edits
- Import/export helpers for source and pipelines
- URL-based sharing with encoded `pipeline` and `data`
- Code generation for:
  - JavaScript
  - TypeScript
  - Python
  - PHP
  - Go
  - jq
- In-app docs with operation examples and workflow references

## Quick Start

```bash
pnpm install
pnpm dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Development Scripts

- `pnpm dev`: start local dev server
- `pnpm build`: production build
- `pnpm start`: run production server
- `pnpm lint`: run ESLint
- `pnpm lint:fix`: run ESLint auto-fix
- `pnpm test`: full Jest run
- `pnpm test:unit`: unit/runtime tests
- `pnpm test:integration`: integration pipeline tests
- `pnpm test:coverage`: unit coverage report
- `pnpm check:dev`: boot app and smoke-check routes
- `pnpm check`: project quality gate (`lint + unit + integration`)
- `pnpm export:ops`: export operation metadata to `operations.json`

## Project Docs

See `docs/` for contributor and architecture documentation:
- `docs/getting-started.md`
- `docs/architecture.md`
- `docs/operations.md`
- `docs/testing.md`
- `docs/agent-workflow.md`
- `docs/plan-todo.md`

## Technical Notes

- Runtime is currently client-first.
- Demo links use encoded pipelines/data and hydrate the workspace automatically.

## Status

Active internal project. Product and API surface may evolve.
