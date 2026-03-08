# API Execution Mode and Integration Surface

## Scope and Source Brief
This document elaborates TODO item `P1) API execution mode and integration surface` in `docs/plan-todo.md`:
- Add backend service to execute pipelines via HTTP (`POST /transform`).
- Define request/response contract compatible with current pipeline format.
- Add API keys/usage limits and basic request logging.
- Add UI action to copy API request snippet from current project.
- Add contract tests to ensure client/runtime parity between browser and API.

## Current State Research

### Pipeline config format that already exists
- Pipeline shape is serialized as `{ v: 1, ops: Operation[] }` in `src/utils/sharing/PipelineSerializer.ts`.
- Share links store pipeline config in query param `pipeline`.
- The `pipeline` param is produced by `PipelineEncoder.encode`, which uses `lz-string` URL-safe compression (`compressToEncodedURIComponent`) in `src/utils/sharing/PipelineEncoder.ts`.
- Import UI already accepts:
  - encoded `pipeline` value,
  - a full URL containing `pipeline`,
  - JSON (`{ v, ops }` or raw `ops[]`) in `components/OperationsToolbar.tsx`.

### Runtime execution path that can be reused
- `executePipelineFromSource` (`src/operations/pipelineExecution.ts`) parses source and executes pipeline.
- `runPipelineOperations` (`src/operations/pipelineRunner.ts`) handles operation-level validation, execution, and returns output or structured error.
- `PipelineValidator` (`src/utils/sharing/PipelineValidator.ts`) validates operation tree shape and nested ops before execution.

### Important compatibility note
Users may call the current encoded pipeline payload "base64", but the app currently emits `lz-string` URL-safe encoded payloads, not standard Base64. API design should support existing payloads directly and optionally add true Base64 compatibility.

## Problem Analysis
Current transformation execution is browser-only. This blocks server-to-server and automation use cases such as webhooks, ETL jobs, and CI data checks. The shortest path is to expose the existing runtime through a stable HTTP contract without introducing pipeline format drift.

## Proposed Feature: `POST /transform`

### Endpoint
- `POST /transform` (or `POST /api/transform` if kept inside Next.js API routing).

### Request contract (MVP)
```json
{
  "pipeline": "<encoded-or-json>",
  "pipelineEncoding": "lz-uri",
  "input": {
    "orders": [
      { "id": "o1", "total": 120 }
    ]
  },
  "options": {
    "includeIntermediate": false
  }
}
```

### Request field rules
- `pipeline`:
  - encoded pipeline string from current share/export flow, or
  - serialized JSON string, or
  - object `{ "v": 1, "ops": [...] }`, or
  - raw operation array `[...]`.
- `pipelineEncoding`:
  - `lz-uri` (default, backward-compatible with current share links),
  - `base64url` (optional compatibility mode for explicit Base64 transport),
  - `json` (when request sends JSON shape directly).
- `input`: JSON value to transform (object/array/scalar).
- `options.includeIntermediate`: optional; include step outputs for debugging.

### Response contract (MVP)
```json
{
  "ok": true,
  "result": {
    "orders": [
      { "id": "o1", "total": 120, "status": "high" }
    ]
  },
  "meta": {
    "pipelineVersion": 1,
    "operationCount": 5,
    "durationMs": 6
  }
}
```

Error response:
```json
{
  "ok": false,
  "error": {
    "code": "PIPELINE_VALIDATION_ERROR",
    "message": "Unknown operation type 'Foo' at root[2]",
    "opId": "op_123"
  }
}
```

### Error taxonomy (recommended)
- `BAD_REQUEST` (malformed JSON/body/unsupported encoding)
- `PIPELINE_DECODE_ERROR`
- `PIPELINE_VALIDATION_ERROR`
- `INPUT_PARSE_ERROR` (if non-JSON source formats are added)
- `OPERATION_RUNTIME_ERROR`
- `RATE_LIMITED`
- `UNAUTHORIZED`

## Integration Surface

### 1) Direct HTTP integration
External systems submit pipeline + payload and receive transformed JSON synchronously.

### 2) SDK/snippet integration
UI exposes "Copy API snippet" (curl + JS fetch) based on current pipeline to speed adoption.

### 3) Link-to-API bridge
A user can copy pipeline from URL `?pipeline=...` and send that exact token to `/transform`.

### 4) Automation/worker integration
Cron jobs and queue workers execute stable, versioned pipelines without browser runtime.

### 5) Governance layer
API keys, request logging, and usage limits provide operational control for multi-tenant usage.

## Possible Scenarios

### Scenario A: No-code to backend handoff
- Analyst builds pipeline in `/`.
- Engineer copies encoded pipeline token.
- Backend calls `/transform` on incoming webhook payloads.

### Scenario B: CI contract validation
- Repo stores canonical pipeline token and fixtures.
- CI calls `/transform` and compares output to golden JSON.
- Regressions in runtime behavior are caught before release.

### Scenario C: Multi-service normalization
- Several services send heterogeneous events to one transformation endpoint.
- Common pipeline normalizes to canonical schema before persistence.

### Scenario D: Customer-specific mappings
- Each tenant has a distinct pipeline token.
- API key + tenant mapping selects allowed pipelines.
- Output is generated with tenant-specific transformations.

### Scenario E: Batch preview then commit
- System runs `/transform` for sample records first.
- If valid, it runs full dataset through same pipeline.
- Failures return structured error payload with failing `opId`.

### Scenario F: Incident replay
- Logged payload and pipeline token are replayed via `/transform`.
- Team reproduces and debugs production transformation issues quickly.

## Implementation Plan

### Phase 1: Contract and decode path (MVP)
1. Add shared API payload parser/normalizer:
   - `src/api/transform/parseRequest.ts`
   - Accept `lz-uri` + JSON forms first.
2. Add API route:
   - `app/transform/route.ts` or `app/api/transform/route.ts`
   - Validate request, decode pipeline, run `PipelineValidator`, execute runtime.
3. Reuse existing runtime modules:
   - `runPipelineOperations`
   - `PipelineSerializer`
   - `PipelineEncoder`
4. Return structured success/error envelopes with stable `error.code`.

### Phase 2: Security and observability
1. API key middleware (header `x-api-key` or `Authorization: Bearer`).
2. Per-key rate limit (in-memory for dev, Redis or managed limiter for production).
3. Request logging (request id, duration, status, operation count, error code).
4. Redaction policy for sensitive request/response fields.

### Phase 3: UI integration
1. Add "Copy API snippet" action in `components/OperationsToolbar.tsx`.
2. Generate snippets for:
   - curl,
   - JavaScript (`fetch`),
   - optional Node server example.
3. Document that snippets can use current encoded pipeline token directly.

### Phase 4: Contract parity and regression safety
1. Add unit tests for parser/decoder and validation errors in `tests/unit/`.
2. Add integration tests for `/transform` route in `tests/e2e/` or route-level tests.
3. Add parity fixtures that compare:
   - browser execution (`executePipelineFromSource`),
   - API execution (`POST /transform`).
4. Include nested operations (`MapArray`, `If`, `Switch`) and `writeResultTo` cases.

## Testing Strategy
- Positive cases:
  - valid encoded pipeline + JSON input,
  - valid raw `{ v, ops }` payload,
  - nested operation pipelines.
- Negative cases:
  - invalid encoded token,
  - unknown operation type,
  - malformed operation config,
  - runtime exception paths.
- Non-functional checks:
  - rate-limit behavior,
  - unauthorized key,
  - large payload boundaries/timeouts.

## Risks and Mitigations
- Format confusion ("Base64" vs `lz-uri`):
  - Mitigation: explicit `pipelineEncoding` + docs + compatibility auto-detection.
- Runtime drift between client and API:
  - Mitigation: shared runtime modules + parity tests.
- Abuse/cost risk on public endpoint:
  - Mitigation: API keys, limits, payload size caps, request timeout.

## Open Decisions
- Route location: `/transform` vs `/api/transform`.
- Whether to auto-detect encoding when `pipelineEncoding` is omitted.
- Whether to support non-JSON inputs (`yaml`, `csv`) in MVP or later.
- Whether intermediate outputs are returned by default or behind option/privileged mode.
