# Bricxley brand migration audit

## Customer-facing result

All application copy, metadata, navigation, authentication, workflow pages, and project-facing documentation now use **Bricxley**. The shared `BricxleyLogo` wordmark is the single logo component used by the main navbar, authenticated workflow navbar, footer, and authentication page.

The existing visual system was preserved: the original mark, colours, typography, layouts, cards, map, and search experience remain intact. The tagline is now “Rent with clarity.”

## Brand assets

- Added `public/favicon.svg`, a lightweight Bricxley “B”/door mark.
- Updated the root route with favicon, touch-icon, application-name, OpenGraph, Twitter, and manifest metadata.
- Added `public/manifest.webmanifest` using the same SVG mark and Bricxley’s existing navy/teal palette.
- Removed the obsolete `public/favicon.ico` after it was no longer referenced.
- No separate social preview image exists in this repository.

## Source audit and retained technical exceptions

A case-insensitive scan of customer-facing sources (`src`, `public`, `README.md`, and `docs/BRD.md`) finds no retired product, URL, or platform markers.

The following non-customer-facing references intentionally remain:

| Location    | Classification    | Reason                                                                 |
| ----------- | ----------------- | ---------------------------------------------------------------------- |
| `AGENTS.md` | Repository policy | Mandatory integration guidance for contributors; not shipped to users. |

The retired wrapper, its build configuration, and its package-manager exception were removed and the normal Vite/TanStack/Nitro build continues to pass.
