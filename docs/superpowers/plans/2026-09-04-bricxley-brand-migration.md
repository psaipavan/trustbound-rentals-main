# Bricxley Brand Migration Implementation Plan

**Goal:** Replace all user-facing In Bound and Lovable branding with Bricxley while preserving the existing product design, routes, and behavior.

**Architecture:** A single brand configuration and reusable Bricxley wordmark will drive shared navigation and authentication branding. User-facing copy, SEO metadata, and local browser-storage prefixes will be migrated mechanically and then audited; build-tool packages and non-rendered Lovable diagnostics remain only where technically required.

## Tasks

- [ ] Create the central Bricxley brand configuration, reusable wordmark/mark, SVG favicon, and root metadata references.
- [ ] Replace user-facing brand copy across components, routes, data copy, legal screens, notifications, README, and BRD without changing layout or interaction behavior.
- [ ] Audit and remove/replace obsolete branded assets and customer-facing Lovable references; preserve build-critical dependencies and document each technical exception.
- [ ] Run repository branding scans, type checking, tests, production build, and browser/mobile visual verification; report any non-user-facing exceptions.

## Rules

- Product name is exactly `Bricxley`.
- Preserve the public navbar, hero, search, discovery, map, typography, spacing, colors, and routes.
- Do not remove `@lovable.dev/vite-tanstack-config` or its required Vite configuration without a compatible replacement.
- Do not leave a user-visible In Bound or Lovable reference.
