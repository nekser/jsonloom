# Deployment Findings (2026-03-08)

## Executive summary

- **Decision**: deploy on **Vercel Hobby**.
- **CI/CD model**: GitHub Actions for quality gate + Vercel Git integration for deployments.
- **Current state**: build/test/audit checks are now green and suitable for deployment.

## Current readiness check (this repo)

Readiness status: **READY_FOR_VERCEL_DEPLOYMENT** (with non-blocking warnings).

Commands run:

- `pnpm lint` ✅
- `pnpm test:unit` ✅
- `pnpm test:integration` ✅
- `pnpm check` ✅ (quality gate passed)
- `pnpm check:dev` ✅ (routes responded, including `/`, `/free`, `/docs`, `/about`)
- `pnpm build` ✅
- `pnpm audit --prod` ✅ (no known vulnerabilities)

### Resolved blockers

- Build/type blockers in nested operation editors fixed.
- Vulnerable dependency chain removed by replacing `json-schema-generator` with local schema inference utility.
- Next.js and Ajv upgraded to patched versions.

### Non-blocking warnings still visible

- Repeated bundler warning from `src/codegen/generate.ts` about `topLevelAwait` and async/await target support.
- Next.js warning about ESLint plugin detection during build.
- Neither warning currently fails `lint`, `check`, `check:dev`, or `build`.

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

## Recommended deployment approach (chosen: Vercel)

1. Create Vercel project from this GitHub repo.
2. Keep `main` as Production Branch.
3. Use Vercel default build settings (`pnpm install`, `pnpm build`, Next.js preset).
4. Enable automatic Preview Deployments for pull requests.
5. Use custom domain only after first successful production deploy.
6. Keep plan on Hobby initially; review usage before considering Pro.

Rationale:

- Lowest ops overhead for Next.js.
- Lowest initial spend (Hobby free tier).
- Native preview/rollback workflow.

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
   - Vercel Git integration handles CD automatically:
     - every push creates deployment
     - PRs get preview URLs
     - production branch updates production deployment
   - GitHub remains the source of truth for merge policy; Vercel handles runtime deployment.

3. **Branch protection**
   - Require CI checks to pass before merge into `main`.
   - Optionally require “Vercel Preview” status before merge for UI-sensitive changes.

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

### Dependency status (resolved)

1. `next` upgraded to `15.5.10`.
2. `ajv` upgraded to `8.18.0`.
3. `json-schema-generator` removed from production dependencies.
4. `pnpm audit --prod` currently reports no known vulnerabilities.

### Remaining app-level risk review

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

1. Add `.github/workflows/ci.yml` from this plan.
2. Enable branch protection on `main` requiring CI checks.
3. Connect repo to Vercel and enable preview/production deploys.
4. Add URL payload size/depth limits before decode and operation-count caps.
5. Add regex safety constraints (safe-regex check, timeboxing, or RE2-style engine).
6. Add path-segment denylist in `setByPath`.
7. Run first production deploy, then smoke-check `/`, `/free`, `/docs`, `/about`.

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

- Quality gate: `pnpm check` passes
- Build checks: `pnpm build` passes
- Dev route smoke: `pnpm check:dev` passes
- URL hydration logic: `components/operations-panel/hooks.ts:7-29`
- Regex execution logic: `src/operations/RegexReplace.ts:26-55`
- Generic path setter: `src/operations/utils.ts:42-100`
- Input size limit: `src/store/operations.ts:71-77`
- Audit command output: `pnpm audit --prod` shows no known vulnerabilities
