# 3. Responsive Application Layout Tiers and Mobile Component Refactoring

Date: 2026-11-02

## Status

Accepted

## Context

Across both the public landing portal and authenticated operational workflows, several UI components suffered from mobile layout failures on narrow (<768px and <640px) viewports:
1. **Pill Badges Wrapping:** Long badge copy (55–65 characters) combined with `whitespace-normal` in `LandingHero` and `DashboardHero` caused pill badges with status indicator dots to break into irregular 3-to-4 line blobs.
2. **Unconstrained Headlines:** `DashboardHero` locked its greeting H1 with `whitespace-nowrap`, causing any dynamic student name to blow out the horizontal viewport and trigger page-wide horizontal scrolling.
3. **Overextended Tabs & Page Headers:** `PageHeader` placed action children inside a right-aligned flex column without `w-full min-w-0`. Filter tabs in `RequestSection` expanded past the viewport boundary rather than scrolling horizontally.
4. **Breadcrumb Bleeding:** `SiteHeader` breadcrumb lists used default wrapping classes (`flex-wrap break-words`). In fixed-height navbar chrome, multi-segment routes wrapped onto 2–3 rows, overflowing and obscuring page content below.
5. **Badge & Text Collisions in Review Cards:** `SectorRequestReview`, `StudentInfoCard`, `RequestDetailsCard`, `ComplianceChecklistCard`, and `OfficeOperationsCard` trapped long titles and multi-word status badges on single unyielding `flex items-center justify-between` rows.

## Decision

1. **Responsive Badges & Truncation:** Enforce `whitespace-nowrap max-w-full truncate` across pill badges. Render shortened labels on small screens (`sm:hidden`) with full labels on `sm:`+ (e.g. `<span className="sm:hidden">Official Records Gateway</span>` and `<span className="sm:hidden">ARCH • AY 2026–2027</span>`).
2. **Responsive Headline Wrapping:** Remove `whitespace-nowrap` on dashboard greetings in favor of `break-words text-balance`, and align paragraph copy with institutional office terminology.
3. **Full-Width Action Headers & Swipeable Tab Strips:** Update `PageHeader`'s children container to `w-full sm:w-auto items-start sm:items-end min-w-0`, and wrap filter tabs in `overflow-x-auto scrollbar-none pb-1` with `w-max shrink-0 sm:w-fit`.
4. **Single-Row Non-Wrapping Breadcrumbs:** Enforce `flex-nowrap overflow-hidden` on `BreadcrumbList`, apply item truncation (`truncate max-w-[110px] sm:max-w-[200px] md:max-w-none`), and collapse intermediate segments on mobile (`hidden sm:inline-flex`) when crumbs exceed 2 levels.
5. **Responsive Subheader Stacking:** Convert rigid `flex items-center justify-between` card headers into responsive stacks (`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0`) with `shrink-0` badges and `break-words` titles.
6. **Swipeable Office Shortcuts:** Convert `OfficeShortcuts` to `flex items-center gap-2 overflow-x-auto flex-nowrap scrollbar-none min-w-0` with `shrink-0` pills.

## Consequences

### Positive
- Completely eliminates horizontal page blow-outs caused by user names, wide tabs, or multi-crumb breadcrumbs.
- Badges maintain strict pill geometry without multi-line text folding.
- Fixed-height top navigation chrome never bleeds or wraps onto page content.
- Adheres strictly to WCAG 2.2 touch target minimums (>= 44px) and `/better-layout` container query principles.

### Negative / Trade-offs
- Intermediate breadcrumb hierarchy is hidden on narrow mobile devices (<640px) in favor of showing the root and the active leaf page.
