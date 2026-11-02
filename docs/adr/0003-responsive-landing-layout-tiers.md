# 3. Responsive Landing Layout Tiers and Mobile Component Suppression

Date: 2026-11-02

## Status

Accepted

## Context

On mobile viewports (<768px), the public document portal's landing page suffered from severe vertical bloat and visual competition:
1. The multi-line `AnnouncementBar` combined with a fixed 80px (`h-20`) sticky navbar consumed over 140px of vertical space before any hero headline was reached.
2. Inside `LandingHero`, the right-hand column rendered a simulated live release terminal ticket card and a secondary tracking form. When stacked vertically on phone screens, this pushed the actual core interactive components (`CollegeOffices`, `CredentialsCatalog`, and the live `TrackRequest` engine) over 900px down the page.
3. Call-to-action buttons had fixed inline padding rather than adaptive full-width containers, risking mis-taps on small (320px–375px) devices.

## Decision

1. **Mobile Announcement Suppression:** Hide `AnnouncementBar` on viewports below the `md:` breakpoint (`hidden md:block`). Essential counter operational hours and quick tracking shortcuts remain accessible inside the mobile navigation drawer (`Sheet`) and footer directory.
2. **Hero Terminal Suppression:** Suppress the simulated ticket terminal card in `LandingHero` on viewports below `lg:` (`hidden lg:block`), keeping the mobile hero tightly focused on the core headline, description, primary CTA buttons, and trust metrics.
3. **Adaptive Sticky Header Height:** Scale `LandingNav` from `h-16` (64px) on mobile to `h-20` (80px) on `sm:`/`md:` and above, reclaiming vertical reading space on smaller screens while maintaining 44px+ touch targets.
4. **Adaptive Touch Targets & Section Density:** Enforce full-width button layouts on mobile (`w-full sm:w-auto`, min 48px height) and reduce card/section padding on mobile (`py-12 sm:py-20`, `p-4 sm:p-5`) across `CollegeOffices`, `CredentialsCatalog`, and `TrackRequest`.

## Consequences

### Positive
- Reclaims critical above-the-fold vertical space on mobile devices, immediately showcasing the institutional gateway brand, value proposition, and primary CTAs.
- Eliminates duplicate tracking inputs on phone screens, guiding requesters directly to the dedicated `TrackRequest` section.
- Enforces WCAG 2.2 compliant touch targets (>= 44px) and edge-to-edge mobile button insets adhering to `/better-layout` principles.

### Negative / Trade-offs
- The decorative simulated release ticket terminal card is not visible on mobile or tablet devices (< 1024px), though full tracking functionality remains available in the dedicated tracking component.
