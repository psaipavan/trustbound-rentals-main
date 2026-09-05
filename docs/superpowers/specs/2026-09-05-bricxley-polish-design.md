# Bricxley Cleanup and Polish Design

## Purpose

Finish the Bricxley migration while preserving the existing rental-search hero, primary search fields, route model, and visual identity. The result should improve interaction feedback, image loading, navigation polish, metadata, and responsiveness without introducing a new animation dependency or a visual redesign.

## Repository findings

- **Framework and router:** React 19 with TanStack Start and TanStack Router.
- **Styling:** Tailwind CSS 4 tokens in `src/styles.css`, with Radix primitives and `tw-animate-css` for interactive UI.
- **Icons and motion:** Lucide icons; existing CSS keyframes, component transitions, lazy map loading, image placeholders, and a reduced-motion override.
- **Data and workflows:** Local prototype repository with tenant interest, chat, and visit flows; no external API or database is removed.
- **Build:** The current Vite wrapper is platform-specific but its underlying plugins are already direct dependencies. It will be replaced with the native Vite/TanStack/Tailwind/path/Nitro configuration so the application keeps its current Cloudflare-oriented build output without the wrapper.

## Decisions

1. Use CSS and existing Radix transitions only. Normal interactions use 150–300ms transform/opacity transitions; every nonessential animation remains disabled for reduced-motion users.
2. Keep the current hero content structure and five primary search fields. Improve only focus, pressed, hover, and entrance states.
3. Use the shared Bricxley wordmark and its derived SVG mark for browser and PWA metadata. No alternate logo is introduced.
4. Improve image behavior through the existing `PropertyImage` boundary: fixed aspect ratios, responsive `sizes`, lazy decoding on cards, eager first gallery image, fade after load, and a usable failure state.
5. Keep local loading local: gallery/image/map/interest/chat states change in place rather than blocking the page.
6. Treat only the repository-policy marker in `AGENTS.md` as an unavoidable non-shipped historical reference. All package, config, lockfile, source, metadata, and project documentation traces are removed or renamed.

## Component design

### Build and metadata

`vite.config.ts` will directly compose Tailwind, tsconfig paths, TanStack Start, Nitro, and React in the order expected by those plugins. The map dependency exclusion and custom server entry are preserved. The obsolete wrapper package and its package-manager exemption are removed through npm, which regenerates the lockfile.

Root metadata adds application and social titles, SVG icon references, and a web manifest. The manifest uses the same SVG mark and truthful Bricxley description.

### Consistent interaction language

The shared button variant becomes transform-aware with a 150ms active press response, ring focus state, disabled stability, and reduced-motion fallback. Shared utility classes define calm 180–320ms entrance, message, and card-image transitions. Navbar links retain the existing active state; the sticky header gains a subtle scroll-only shadow and mobile-sheet links preserve visible focus.

Search fields receive `focus-within` ring and border feedback without resizing. Property cards keep their current 4px hover lift and add only image-scale/focus feedback. The map skeleton becomes layout-shaped rather than a standalone spinner.

### Loading and workflows

Gallery navigation uses a tested index helper, arrow-key controls, selected thumbnail semantics, and the existing image loading boundary. Interest-form steps receive an opacity/short horizontal transition. Chat bubbles receive a short entry animation, while existing dialog and sheet behavior keeps keyboard escape/focus trapping from Radix.

### Validation

Validate source cleanup, type checking, targeted lint, unit tests, production build, and live browser flows. Browser checks cover desktop/tablet/mobile home, rent/filter/map, property/gallery, interest, chat, visit scheduler, tenant workflow, owner dashboard, footer, metadata, console, and failed network assets where observable.
