# Collaboration and Share-Link Upgrades

## Scope and Source Brief
This document elaborates TODO item `P2) Collaboration and share-link upgrades` in `docs/plan-todo.md`:
- Add optional short-link service (instead of long encoded URLs only).
- Add share metadata (`title`, `notes`, `createdBy`, `expiresAt`).
- Add immutable snapshot IDs and “fork from shared” flow.
- Add link safety checks and malformed payload diagnostics.
- Add E2E tests for share/open/fork lifecycle.

Additional product direction for this feature:
- Two users on different machines can collaborate in real time on the same pipeline and source data (Google Docs style).

## Current State Research

### Existing sharing behavior
- Sharing is currently URL-only and client-side:
  - pipeline is serialized as `{ v: 1, ops }` in `src/utils/sharing/PipelineSerializer.ts`.
  - payload is compressed using `lz-string` URI encoding in `src/utils/sharing/PipelineEncoder.ts`.
  - URL hydration reads `pipeline` and `data` query params in `components/operations-panel/hooks.ts`.
- `components/OperationsToolbar.tsx` supports:
  - share URL generation,
  - JSON export,
  - import from encoded payload, URL, or JSON.

### Existing runtime/editor behavior
- Editor state is local Zustand state in `src/store/operations.ts` (`sourceText`, `sourceFormat`, `operations`, result state, undo/redo stacks).
- There is no backend persistence for workspaces/sessions and no live collaboration channel.

## Problem Analysis
1. State sharing problem:
- URL payload sharing is static and copy/paste based.
- There is no canonical server-side document to attach multiple users to.
- Large source + pipeline payloads create long links and weak lifecycle control.

2. Race condition problem:
- Two editors concurrently changing operation order/config can create divergent local histories.
- Local undo/redo assumes single-writer semantics.
- Without conflict resolution, last-write-wins can drop user edits.

3. Share-link gaps:
- No immutable version identity, no expiry semantics, no role-based edit/view access.
- Malformed/partial payload diagnostics are limited.

## Proposed Feature

### Product capabilities
1. Immutable snapshot sharing:
- Save current document as immutable snapshot.
- Share short link to snapshot (`view` mode).
- Snapshot supports metadata (`title`, `notes`, `createdBy`, `expiresAt`).

2. Live collaboration sessions:
- Create a live session from current state.
- Share short link to session (`edit` or `view` role).
- Multiple clients see updates in near real time.

3. Fork flow:
- Open snapshot/session and fork into a new editable document.
- Parent-child lineage is tracked for audit/debug.

4. Safety and diagnostics:
- Expired/invalid links return actionable diagnostics.
- Payload/schema validation errors reference the failing field and reason.

## Domain Model

### Document types
- `Snapshot` (immutable):
  - `id`, `shortCode`, `title`, `notes`, `createdBy`, `createdAt`, `expiresAt`, `stateBlob`, `hash`, `schemaVersion`.
- `Session` (mutable live doc):
  - `id`, `shortCode`, `title`, `createdBy`, `createdAt`, `expiresAt`, `baseSnapshotId?`, `status`, `accessMode`.
- `SessionState`:
  - `sourceText`, `sourceFormat`, `operations`, `updatedAt`, `updatedBy`.

### Link shape
- Snapshot link: `/s/{shortCode}`
- Session link: `/c/{shortCode}`
- Legacy compatibility: existing `?pipeline=...&data=...` remains supported and can be converted to snapshot/session.

## Real-Time Architecture

### Collaboration engine (recommended)
- Use a CRDT document (Yjs) as the collaboration state model.
- Use WebSocket transport (`y-websocket` compatible server or equivalent managed realtime layer).
- Persist periodic snapshots of CRDT state to durable storage.

### Why CRDT here
- Google Docs style collaboration requires safe concurrent edits with minimal locking.
- CRDT avoids custom OT/rebase logic for concurrent array + object + text edits.
- Offline/reconnect behavior is easier: clients replay document updates and converge.

### State mapping to CRDT
- `sourceText` -> `Y.Text`
- `sourceFormat` -> scalar field in `Y.Map`
- `operations` -> `Y.Array<Y.Map>` where each op map includes:
  - `id`, `type`, `enabled`, `config`, `meta`
- `config` stored as nested `Y.Map`/JSON-compatible objects.

### Client integration approach
- Add collaboration adapter layer between CRDT document and Zustand store.
- Local store remains rendering/runtime source of truth, but values are synced from CRDT transactions.
- Existing `runPipeline()` stays client-side; it executes after local/remote state application.

## Handling Race Conditions

### Conflict semantics
1. Concurrent text edits (`sourceText`):
- CRDT text merge by position; both users’ edits are preserved.

2. Concurrent operation config edits (same op):
- Field-level CRDT merge by key path.
- If the exact same scalar key is edited concurrently, deterministic CRDT ordering resolves it.

3. Concurrent reorder/delete:
- Operation identity is stable by `op.id`.
- Reorder uses CRDT array move semantics; delete tombstones are propagated.
- If one user edits an op while another deletes it, deletion wins and UI shows non-blocking notice (“operation removed remotely”).

4. Stale client updates:
- Server broadcasts update clock and client ids; out-of-order updates are ignored by CRDT clock semantics.
- On reconnect, full sync + missed update replay restores convergence.

### Transaction boundaries
- Group UI intents into atomic CRDT transactions:
  - add operation,
  - update config patch,
  - reorder,
  - bulk enable/disable.
- This prevents partial intermediate states from flashing on peers.

### Undo/redo behavior
- Session-aware undo/redo should be local-intent undo only (per user), not global timeline rollback.
- Keep current local undo stack for non-collab mode; for collab mode use CRDT-aware undo manager.

## Share-Link Upgrades

### Short-link service
- Generate URL-safe short codes (e.g., base62, 8-12 chars) mapped server-side to snapshot/session IDs.
- Do not embed full payload in the shared URL by default.

### Metadata and lifecycle
- Metadata fields:
  - `title`, `notes`, `createdBy`, `expiresAt`, `createdAt`, `updatedAt`.
- Lifecycle states:
  - `active`, `expired`, `revoked`.

### Link safety checks
- Validate link code format and existence.
- Validate expiry and access role.
- Validate schema version and state hash before hydration.
- Return typed diagnostics:
  - `SHARE_NOT_FOUND`,
  - `SHARE_EXPIRED`,
  - `SHARE_REVOKED`,
  - `STATE_SCHEMA_UNSUPPORTED`,
  - `STATE_CORRUPT`.

## API Surface (MVP)

### Snapshot APIs
- `POST /api/shares/snapshots`
  - Input: current state + metadata.
  - Output: `snapshotId`, `shortCode`, `url`.
- `GET /api/shares/snapshots/:shortCode`
  - Output: immutable snapshot payload + metadata.
- `POST /api/shares/snapshots/:shortCode/fork`
  - Output: new session or snapshot ID (depending on request mode).

### Live session APIs
- `POST /api/shares/sessions`
  - Create session from current state or snapshot.
- `GET /api/shares/sessions/:shortCode`
  - Bootstrap state and collaboration endpoint metadata.
- `WS /api/shares/sessions/:sessionId/live`
  - Real-time CRDT update channel.

## UX Flow
1. User clicks `Share`.
2. Dialog offers:
- `Snapshot link (immutable)`
- `Live collaboration link`
3. User sets metadata and optional expiry.
4. App returns short link and copies to clipboard.
5. Recipient opens link:
- Snapshot opens read-only with `Fork` button.
- Session opens live with presence indicator and collaborator cursors/status.

## Migration and Compatibility
- Keep current URL-encoded import/export fully supported.
- Add “Convert current URL payload to snapshot” action for legacy links.
- Serialization version remains `v: 1` initially; add server-side schema wrapper for forward migrations.

## Implementation Plan

### Phase 1: Share-link foundation
1. Add backend models for snapshot/session/metadata.
2. Implement short-link resolver and immutable snapshot APIs.
3. Update share dialog UI to create snapshot links with metadata.
4. Add diagnostics UI for invalid/expired links.

### Phase 2: Live collaboration
1. Integrate CRDT library and websocket backend.
2. Add Zustand <-> CRDT sync adapter.
3. Add presence indicators and remote-change notices.
4. Support role modes (`view`, `edit`) per link.

### Phase 3: Fork and lifecycle controls
1. Implement fork-from-snapshot/session.
2. Add revoke/expiry controls and status handling.
3. Add lineage metadata (`forkedFrom`).

### Phase 4: Hardening
1. Add payload limits and rate limiting.
2. Add telemetry: session count, merge conflict notices, reconnect rates.
3. Add recovery flows for websocket drops and schema mismatch.

## Testing Strategy

### Unit tests
- Link resolver and metadata validation.
- Snapshot/session schema validation.
- Diagnostics code mapping.
- CRDT adapter transformations for add/update/delete/reorder operations.

### Integration tests
- API lifecycle: create snapshot, open, fork, create session.
- Expiry/revoke behavior.
- Legacy URL payload conversion path.

### E2E tests (Playwright)
- Share snapshot -> open on second browser context -> verify read-only state.
- Fork snapshot -> edit fork -> verify original unchanged.
- Open live session in two contexts -> verify real-time updates both ways.
- Concurrent reorder + config edit scenario -> verify deterministic final state and no crash.
- Invalid/expired link -> verify diagnostic message.

## Risks and Mitigations
- CRDT complexity and bundle size:
  - Mitigation: lazy-load collaboration layer only on `/c/*` routes and shared-session mode.
- Backend operational overhead:
  - Mitigation: start with single-region MVP + short TTL sessions.
- Permission leakage from shared links:
  - Mitigation: split view/edit tokens and support revoke.
- Divergence between local undo model and collaborative edits:
  - Mitigation: use CRDT-aware undo manager only in collab mode.

## Open Decisions
- Identity model for collaborators in MVP:
  - anonymous nicknames vs authenticated users.
- Session persistence window:
  - ephemeral (e.g., 24h) vs durable sessions.
- Edit lock option:
  - whether to allow optional section-level lock mode for enterprise users.
- Presence granularity:
  - whether to show per-field cursor vs simple “currently editing operation X”.
