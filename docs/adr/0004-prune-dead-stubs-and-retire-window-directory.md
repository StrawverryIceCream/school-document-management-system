# 4. Prune Dead Code Stubs and Retire Legacy Window Directories

Date: 2026-11-03

## Status

Accepted

## Context

Following the adoption of ADR 0002 ("Retire Physical Service Windows in Favor of Office Custody and Live QR Handoff") and iterative improvements across authentication, request filing, and review flows:
1. Eleven orphaned components, placeholder stubs, and obsolete routing dictionaries remained in the frontend source tree totaling 792 lines of dead code (e.g., `LoginForm.tsx`, `SignupForm.tsx`, `MyRequestDetails.tsx`, `DocumentList.tsx`, `NewRequestFormHeader.tsx`, `AccountsPagination.tsx`, `WindowPlaceholderView.tsx`, `WindowOperationsCard.tsx`, `lib/windows/windows.ts`, `lib/windows/index.ts`, `button-group.tsx`, `ui/sonner.tsx`).
2. Active sector review cards and review data helpers remained located inside `components/windows/review/` and `lib/windows/review/`, which preserved misleading "window" nomenclature despite the system having transitioned to decentralized Processing Offices.
3. Multiple duplicate auth forms created ambiguity when reviewing authentication, validation, and role rules.

## Decision

1. **Delete Dead Components and Stubs**:
   - Remove obsolete auth forms (`LoginForm.tsx`, `SignupForm.tsx`) in favor of canonical `LoginCard.tsx` and `RegistrationForm.tsx`.
   - Remove dead request filing stubs (`MyRequestDetails.tsx`, `DocumentList.tsx`, `NewRequestFormHeader.tsx`).
   - Remove dead pagination wrapper `AccountsPagination.tsx` (fully superseded by `DataTablePagination` inside `DataTable.tsx`).
   - Remove unused UI components (`button-group.tsx`, `ui/sonner.tsx`).
   - Remove retired window stubs (`WindowPlaceholderView.tsx`, `WindowOperationsCard.tsx`).
2. **Relocate Review Modules to Sector Domain**:
   - Move active request review components from `frontend/src/components/windows/review/` to `frontend/src/components/sectors/review/`.
   - Move active review helpers from `frontend/src/lib/windows/review/` to `frontend/src/lib/sectors/review/`.
   - Update callers (`SectorRequestReview.tsx`, `FilePreviewDialog.tsx`, and intra-review imports).
   - Prune empty `frontend/src/components/windows/` and `frontend/src/lib/windows/` directories.

## Consequences

### Positive
- Pruned 792 lines of dead code, eliminating ghost components and developer confusion.
- Complete retirement of physical "window" filesystem paths in favor of the canonical Processing Office domain model.
- Bundle and test pipelines remain fully green (`tsc -b`, all 9 frontend test suites, Vite build).

### Negative / Trade-offs
- Historical documentation plans referencing `components/windows/` now refer to retired directory locations.
