# Deployment Findings (2026-03-08)

## Executive summary

- **Recommended hosting for lowest cost + least friction**: **Vercel Hobby** first.
- **Alternative for maximum cost minimization**: **Cloudflare Workers + OpenNext** (cheaper at scale, more setup complexity).
- **Do not deploy yet**: current repo has a **production build blocker** and **known dependency vulnerabilities**.

## Current readiness check (this repo)

Commands run:

- `pnpm lint` ✅
- `pnpm test:unit` ✅ (20/20 suites passed)
- `pnpm test:integration` ✅ (59/59 suites passed)
- `pnpm check:dev` ✅ (routes responded, including `/`, `/free`, `/docs`, `/about`)
- `pnpm build` ❌
- `pnpm audit --prod` ❌ (13 vulnerabilities: 3 critical, 2 high, 8 moderate)

### Build blocker

`pnpm build` fails on:

- `components/operations-panel/IfEditorCard.tsx:24`
- `components/operations-panel/IfEditorCard.tsx:25`

TypeScript rejects `JSONValue[]` -> `Operation[]` assertion in build type-check.

## Hosting options (cost-focused)

### 1) Vercel (recommended starting point)

Why:

- Native Next.js hosting, lowest ops effort.
- GitHub integration gives automatic Preview + Production deploys.
- Zero baseline cost on Hobby.

Cost snapshot:

- Hobby: **Free forever**.
- Pro: **$20/month + usage**.
- Hobby includes examples like **1M edge requests/month** and **100 GB fast data transfer/month**.

Best fit here:

- Your app is primarily client-side and this keeps deployment simple.
- No custom infra needed for first production launch.

### 2) Cloudflare Workers + OpenNext (best for long-term cost efficiency)

Why:

- Very strong low-cost runtime economics.
- Next.js App Router is supported through Cloudflare’s OpenNext adapter.

Cost snapshot:

- Free plan includes Workers/Pages usage.
- Paid plan has **$5/month minimum**.
- Workers Free baseline includes **100,000 requests/day** with **10ms CPU per invocation**.

Tradeoff:

- More platform-specific setup vs Vercel.
- Better if you are comfortable owning adapter/runtime details.

### 3) Railway

Cost snapshot:

- Hobby is **$5 minimum usage**, includes $5 usage credits.
- More infra flexibility, but usually not cheaper than Vercel Hobby for this app profile.

### 4) Netlify

Cost snapshot:

- Free: **$0 forever**, usage-credit model (300 monthly credit limit).
- Personal: **$9/month**.
- Pro: **$20/member/month**.

Tradeoff:

- Works well with Git-based CI/CD, but Next.js experience is generally less direct than Vercel-first path.

## Recommended deployment approach

1. **Phase 1 (now):** Deploy on **Vercel Hobby**.
2. **Phase 2 (if costs grow):** evaluate migration to **Cloudflare Workers + OpenNext**.

Rationale:

- Lowest immediate cost and lowest implementation risk.
- Fastest path to reliable CI/CD and previews.

## GitHub CI/CD design

There is currently **no `.github/workflows/`** directory in this repo.

Recommended pipeline:

1. **CI on pull requests and pushes**
   - `pnpm install --frozen-lockfile`
   - `pnpm lint`
   - `pnpm test:unit`
   - `pnpm test:integration`
   - `pnpm build`
   - `pnpm audit --prod --audit-level=high`

2. **Deployment**
   - Vercel Git integration handles deploys automatically:
     - every push creates deployment
     - PRs get preview URLs
     - production branch updates production deployment

3. **Branch protection**
   - Require CI checks to pass before merge into `main`.

### Example `ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm build
      - run: pnpm audit --prod --audit-level=high
```

## Security findings

### Critical / high deployment risks

1. **Framework vulnerabilities in `next@15.5.2`**
   - Audit reports critical/high advisories affecting current version.
   - Recommendation from advisories reaches at least `15.5.10` for full listed set.

2. **Transitive vulnerable chain via `json-schema-generator`**
   - Pulls deprecated/vulnerable packages (`request`, `form-data`, `minimist`, `qs`, `tough-cookie`).
   - This is currently a production dependency and should be removed/replaced if possible.

3. **`ajv@8.17.1` flagged (ReDoS advisory)**
   - Upgrade to patched version (`>=8.18.0`).

### App-level risk review

1. **Potential client-side DoS via shared URL hydration**
   - URL payload is decoded and JSON-stringified without explicit query-size/decompression bounds in hydration path.
   - File: `components/operations-panel/hooks.ts:7-29`

2. **Regex backtracking risk**
   - User-provided regex is compiled and executed across arbitrary JSON trees.
   - Can freeze browser tab with catastrophic regex patterns.
   - File: `src/operations/RegexReplace.ts:26-55`

3. **Path write guard gap (`__proto__` style keys)**
   - Generic `setByPath` should explicitly block dangerous segments (`__proto__`, `prototype`, `constructor`).
   - File: `src/operations/utils.ts:42-100`

### Positive findings

- Minimal server surface: only demo redirect route, no user auth/session backend.
- Demo route uses fixed map and local file reads, reducing traversal risk.
- Source editor enforces a **5MB limit** in store setter.
  - File: `src/store/operations.ts:71-77`

## Can this app be used in a harmful way?

Yes, but mostly in **client-side abuse scenarios**, not server compromise:

- Malicious shared links can attempt to overload browser CPU/memory.
- Pathological regex in pipelines can lock UI threads.
- Tool can be used to transform/obfuscate malicious data payloads, but it does not execute arbitrary code or provide remote command capability.

## Go-live checklist (minimum)

1. Fix build type error in `IfEditorCard.tsx`.
2. Upgrade `next` to a patched release (target at least `15.5.10` or newer stable).
3. Upgrade `ajv` to `>=8.18.0`.
4. Remove or replace `json-schema-generator` (or isolate to dev-only if possible).
5. Add URL payload size/depth limits before decode and operation-count caps.
6. Add regex safety constraints (safe-regex check, timeboxing, or RE2-style engine).
7. Add path-segment denylist in `setByPath`.
8. Add GitHub Actions CI workflow and enforce required checks.

## References

### Pricing / platform docs

- Vercel pricing: https://vercel.com/pricing
- Vercel GitHub deployments: https://vercel.com/docs/deployments/git/vercel-for-github
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Next.js on Workers (OpenNext): https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Railway pricing: https://railway.com/pricing
- Netlify pricing: https://www.netlify.com/pricing/
- Netlify deploy with Git: https://docs.netlify.com/site-deploys/create-deploys/#deploy-with-git

### CI billing

- GitHub Actions billing: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions

### Local code and command evidence

- Build error location: `components/operations-panel/IfEditorCard.tsx:24-25`
- URL hydration logic: `components/operations-panel/hooks.ts:7-29`
- Regex execution logic: `src/operations/RegexReplace.ts:26-55`
- Generic path setter: `src/operations/utils.ts:42-100`
- Input size limit: `src/store/operations.ts:71-77`
- Audit command output: `pnpm audit --prod --json` (run on 2026-03-08)
