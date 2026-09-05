# Bricxley Brand Migration Implementation Plan

**Goal:** Replace all user-facing retired branding with Bricxley while preserving the existing product design, routes, and behavior.

**Architecture:** A single brand configuration and reusable Bricxley wordmark drive shared navigation and authentication branding. User-facing copy, SEO metadata, and local browser-storage prefixes are migrated mechanically and then audited; platform-specific build tooling is replaced with compatible native configuration.

## Tasks

- [ ] Create the central Bricxley brand configuration, reusable wordmark/mark, SVG favicon, and root metadata references.
- [ ] Replace user-facing brand copy across components, routes, data copy, legal screens, notifications, README, and BRD without changing layout or interaction behavior.
- [ ] Audit and remove/replace obsolete branded assets and customer-facing retired-platform references; preserve required infrastructure and document each technical exception.
- [ ] Run repository branding scans, type checking, tests, production build, and browser/mobile visual verification; report any non-user-facing exceptions.

## Rules

- Product name is exactly `Bricxley`.
- Preserve the public navbar, hero, search, discovery, map, typography, spacing, colors, and routes.
- Replace retired build tooling only with a compatible native configuration.
- Do not leave a user-visible retired-product or retired-platform reference.
