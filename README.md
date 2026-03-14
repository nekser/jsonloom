# JSONLoom

[![CI](https://github.com/nekser/jsonloom/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/nekser/jsonloom/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/nekser/jsonloom)](https://github.com/nekser/jsonloom/blob/main/LICENSE)
![Node >=20](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)
![pnpm >=9](https://img.shields.io/badge/pnpm-%3E%3D9-F69220?logo=pnpm&logoColor=white)
[![Coverage](https://codecov.io/gh/nekser/jsonloom/branch/main/graph/badge.svg)](https://codecov.io/gh/nekser/jsonloom)
[![Deploy](https://img.shields.io/github/deployments/nekser/jsonloom/Production?label=deploy&logo=vercel)](https://github.com/nekser/jsonloom/deployments)

Visual, browser-based workspace for transforming structured data with composable operation pipelines.

## What It Does

- Load source data (`JSON`)
- Build ordered transformation pipelines
- Preview results live after each change
- Share reproducible pipelines via URL

Primary app route: `/`  
Documentation route: `/docs`

## Core Model

Input data + ordered operations => transformed output

- Operations are typed and validated.
- Runtime executes client-side with error reporting and per-step metadata.

## Current Feature Set

- Operation catalog across object, array, string, math, control flow, validation, and date categories
- Nested pipelines for advanced operations (`MapArray`, `If`, `Switch`)
- Undo/redo for pipeline edits
- Import/export helpers for source and pipelines
- URL-based sharing with encoded `pipeline` and `data`
- In-app docs with operation examples and workflow references

## Quick Start

```bash
pnpm install
pnpm dev
```

Open: [http://localhost:3000](http://localhost:3000)

Set env values as needed (example):

```bash
NEXT_PUBLIC_CONTACT_EMAIL=maintainers@example.com
```

For full env options, copy from [`.env.example`](./.env.example).

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
- `pnpm seo:submit-sitemap`: submit sitemap to Google Search Console (env-driven)
- `pnpm seo:indexnow`: notify IndexNow endpoint for key URLs (env-driven)
- `pnpm seo:notify`: run sitemap submit + IndexNow notify

## Security and Privacy

- Privacy controls (in app): `/privacy` and `/cookies`
- Telemetry is consent-gated and URL query payloads are sanitized before analytics events

## Roadmap Expectations

- The project is pre-1.0 and may evolve quickly.
- Backward compatibility is a goal, but breaking changes can happen in early versions.
- Major behavior changes should be documented in [CHANGELOG.md](./CHANGELOG.md) and discussed in issues.
