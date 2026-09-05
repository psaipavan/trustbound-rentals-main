# Bricxley Cleanup and Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the retired build scaffold and complete Bricxley’s production-ready visual, interaction, loading, metadata, and regression polish without redesigning the rental experience.

**Architecture:** Replace the platform wrapper with the existing direct Vite/TanStack/Tailwind/Nitro dependencies, then extend the existing shared CSS, image, dialog, and workflow boundaries. Reuse Radix and CSS for motion, with transform/opacity-only effects and motion-reduction fallbacks.

**Tech Stack:** React 19, TypeScript, TanStack Start/Router/Query, Vite 8, Nitro, Tailwind CSS 4, Radix UI, Vitest, MapLibre.

**Spec:** `docs/superpowers/specs/2026-09-05-bricxley-polish-design.md`

## Global Constraints

- Keep the existing hero structure, primary search fields, visual hierarchy, routes, and workflow behavior.
- Do not add an animation package; use existing CSS, Tailwind, and Radix behavior.
- Use 120–400ms interaction timing and animate transform/opacity, not layout dimensions.
- Preserve local loading; do not add a full-screen loader for normal interactions.
- Respect `prefers-reduced-motion: reduce` everywhere new motion is added.
- Remove all retired-platform package/config/content references except the non-shipped repository policy marker required by `AGENTS.md`.
- Use npm for dependency and lockfile changes.

---

### Task 1: Replace the build wrapper and clean project metadata

**Files:**

- Modify: `vite.config.ts`, `package.json`, `package-lock.json`, `bunfig.toml`, `src/routes/__root.tsx`
- Create: `public/manifest.webmanifest`
- Modify: `docs/BRAND_AUDIT.md`, `docs/superpowers/plans/2026-09-04-bricxley-brand-migration.md`

**Interfaces:**

- Consumes: direct dependencies `@tanstack/react-start/plugin/vite`, `@tailwindcss/vite`, `nitro/vite`, and `@vitejs/plugin-react`, plus Vite's native TypeScript-path resolution.
- Produces: a standard Vite configuration that preserves `server: { entry: "server" }`, map worker exclusions, and the existing production output.

- [ ] **Step 1: Capture the current build as baseline**

Run: `npm run build`

Expected: existing production build succeeds before config replacement.

- [ ] **Step 2: Replace the wrapper with native plugin configuration**

Implement `defineConfig(({ command }) => ({ plugins: [tailwindcss(), tanstackStart({ importProtection: { behavior: "error", client: { files: ["**/server/**"], specifiers: ["server-only"] } }, server: { entry: "server" } }), ...(command === "build" ? [nitro({ defaultPreset: "cloudflare-module" })] : []), react()], optimizeDeps: { exclude: ["maplibre-gl"] }, resolve: { tsconfigPaths: true } }))`.

- [ ] **Step 3: Remove the obsolete dependency using npm**

Run the npm uninstall command for the retired Vite wrapper package.

Then remove only the associated package-manager exemptions from `bunfig.toml`.

- [ ] **Step 4: Add Bricxley PWA/browser metadata**

Add `application-name`, OpenGraph title/description, SVG `apple-touch-icon` and manifest links in the root head. Create a manifest using `Bricxley`, the existing `favicon.svg`, `display: "standalone"`, and the existing navy/teal palette.

- [ ] **Step 5: Remove stale project documentation references**

Rewrite migration-plan wording and update the brand audit so only the required repository policy marker is classified as retained and no customer/project documentation carries old branding.

- [ ] **Step 6: Verify config replacement**

Run: `npx tsc --noEmit && npm run build`

Expected: both exit successfully with no wrapper import or package dependency remaining.

### Task 2: Test and improve gallery/image loading behavior

**Files:**

- Create: `src/components/property/gallery-navigation.test.ts`
- Modify: `src/components/property/PropertyGallery.tsx`, `src/components/property/PropertyImage.tsx`, `src/components/property/PropertyCard.tsx`

**Interfaces:**

- Produces: `getNextGalleryIndex(current: number, length: number, direction: "previous" | "next"): number` for keyboard gallery navigation.
- Consumes: existing `PropertyImage` rendering boundary for gallery and card images.

- [ ] **Step 1: Write the failing gallery-navigation test**

Add assertions that next moves from index `3` to `0`, previous moves from `0` to `3`, and a one-image gallery stays at `0`.

- [ ] **Step 2: Run the focused test to verify RED**

Run: `npm test -- src/components/property/gallery-navigation.test.ts`

Expected: fail because the navigation helper is not exported.

- [ ] **Step 3: Implement the helper and keyboard gallery behavior**

Export the modulo-based helper from `PropertyGallery.tsx`; make the gallery focusable, handle ArrowLeft/ArrowRight, and provide an `aria-live` photo label. Use `PropertyImage` for the main image with `loading="eager"` and responsive sizes; retain lazy thumbnails.

- [ ] **Step 4: Reset image state when image source changes**

In `PropertyImage`, reset `loaded`/`failed` when `src` changes; accept explicit `loading`, `sizes`, and `fetchPriority` props. Card images pass card-appropriate `sizes`; gallery image passes detail-appropriate sizes.

- [ ] **Step 5: Run the focused test to verify GREEN**

Run: `npm test -- src/components/property/gallery-navigation.test.ts`

Expected: all gallery index assertions pass.

### Task 3: Normalize motion, focus, navigation, and loading primitives

**Files:**

- Modify: `src/styles.css`, `src/components/ui/button.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/WorkflowNavbar.tsx`, `src/components/search/SearchBar.tsx`, `src/components/map/LazyMapView.tsx`, `src/components/property/SecureChat.tsx`

**Interfaces:**

- Consumes: existing Tailwind tokens, shared `Button`, Radix sheet, and `prefers-reduced-motion` global rules.
- Produces: a uniform 150ms button press/focus state, scroll-aware headers, focus-within search fields, structured map skeleton, and subtle chat-message entry state.

- [ ] **Step 1: Establish failing behavior in the browser**

Record browser evidence that the sticky header has no scroll-only elevation, the map fallback is a spinner-only block, and gallery/card interaction feedback is not fully consistent.

- [ ] **Step 2: Add shared motion tokens without changing layout**

Define 180–320ms keyframes/utilities for short section, step, image, and message entrance states. Keep the existing reduced-motion selector authoritative and use only opacity/transform.

- [ ] **Step 3: Normalize controls and navigation**

Update `Button` variants for 150ms transform-aware hover/active/focus behavior without size changes. Track `window.scrollY > 8` in both navbars and apply the existing soft shadow only after scrolling. Add `focus-within` border/ring feedback to search fields.

- [ ] **Step 4: Replace spinner-only map loading and add chat feedback**

Render a static map-shaped skeleton with accessible loading text, rather than a continuously spinning icon. Apply the message-enter motion class to newly rendered chat bubbles and keep it disabled by reduced motion.

- [ ] **Step 5: Check accessible interaction output**

Run: `npx eslint src/styles.css src/components/ui/button.tsx src/components/layout/Navbar.tsx src/components/layout/WorkflowNavbar.tsx src/components/search/SearchBar.tsx src/components/map/LazyMapView.tsx src/components/property/SecureChat.tsx`

Expected: zero lint errors; any existing fast-refresh warning is recorded separately.

### Task 4: Polish the interest, visit, and property action flows

**Files:**

- Modify: `src/components/workflow/InterestWizard.tsx`, `src/routes/property.$propertyId.interest.tsx`, `src/components/property/VisitScheduler.tsx`, `src/components/property/PropertyCard.tsx`
- Test: `src/components/workflow/InterestWizard.test.ts`

**Interfaces:**

- Consumes: existing `isSubmitting` prop and route mutation state.
- Produces: a motion-safe content transition per interest step, stable sending label, and explicit, accessible status feedback.

- [ ] **Step 1: Add a failing unit assertion for interest-step content**

Extend the existing wizard test to assert the review step still exposes `Send Interest` and exposes `Sending…` while its supplied submitting state is true.

- [ ] **Step 2: Run the focused wizard test to verify RED**

Run: `npm test -- src/components/workflow/InterestWizard.test.ts`

Expected: fail if the state-specific label or motion-state contract is missing.

- [ ] **Step 3: Add motion-safe action feedback**

Place each step’s content in a keyed motion-safe wrapper. Preserve the submit mutation and redirect behavior; use `aria-live="polite"` for sending/success feedback. Add short press feedback to the save control and visit request action through shared controls.

- [ ] **Step 4: Verify the wizard test turns GREEN**

Run: `npm test -- src/components/workflow/InterestWizard.test.ts`

Expected: test passes and existing wizard assertions remain valid.

### Task 5: Run the full regression and audit matrix

**Files:**

- Modify: `docs/BRAND_AUDIT.md`
- Create: `/tmp/bricxley-polish-*.png` screenshots (not committed)

**Interfaces:**

- Consumes: complete native configuration and polished components.
- Produces: a documented audit with classified repository traces, validation result, and screenshot paths.

- [ ] **Step 1: Run static checks**

Run: `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build`.

Expected: typecheck, unit tests, and production build pass. Categorize any lint findings as pre-existing or fix them when introduced by this work.

- [ ] **Step 2: Run scoped and repository-wide retired-platform scans**

Run case-insensitive searches over source, public files, project docs, package/config/lockfiles, scripts, and deployment files. Document the required `AGENTS.md` policy exception.

- [ ] **Step 3: Perform browser regression**

At 375×812, 390×844, 768×1024, 1024×768, 1366×768, 1440×900, and 1920×1080 inspect home, mobile menu, search/filter/map, property gallery/save, interest flow, chat, visit dialog, tenant workflow, owner dashboard, and footer. Verify title/favicon/manifest, console errors, error overlays, failed requests, responsive overflow, keyboard gallery navigation, and reduced-motion state.

- [ ] **Step 4: Commit the completed polish branch**

Run: `git add package.json package-lock.json bunfig.toml vite.config.ts public src docs && git commit -m "feat: complete Bricxley cleanup and polish"`

Expected: a normal, non-rewritten local commit on `bricxley-polish`.
