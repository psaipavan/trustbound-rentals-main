# Bricxley brand migration audit

## Customer-facing result

All application copy, metadata, navigation, authentication, workflow pages, and project-facing documentation now use **Bricxley**. The shared `BricxleyLogo` wordmark is the single logo component used by the main navbar, authenticated workflow navbar, footer, and authentication page.

The existing visual system was preserved: the original mark, colours, typography, layouts, cards, map, and search experience remain intact. The tagline is now “Rent with clarity.”

## Brand assets

- Added `public/favicon.svg`, a lightweight Bricxley “B”/door mark.
- Updated the root route to reference that SVG favicon.
- Removed the obsolete `public/favicon.ico` after it was no longer referenced.
- No manifest, PWA configuration, social preview image, or other public brand asset exists in this repository.

## Source audit and retained technical exceptions

A case-insensitive scan of customer-facing sources (`src`, `public`, `README.md`, and `docs/BRD.md`) finds no references to the retired product name, its legacy subdomain, or the old platform name.

The following non-customer-facing references intentionally remain:

| Location | Classification | Reason |
| --- | --- | --- |
| `package.json` | Technical dependency | Required Vite/TanStack configuration package. |
| `vite.config.ts` | Technical configuration | Imports the required Vite integration; removing it breaks the build. |
| `bunfig.toml` | Technical configuration | Allows the same required package during installation. |
| `AGENTS.md` | Repository policy | Mandatory integration guidance for contributors; not shipped to users. |

The migration planning record is also retained as internal project history. It is not customer-facing content.
