// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // Nitro/Vite builds from this entry.
    server: { entry: "server" },
  },
  vite: {
    // MapLibre ships its own web worker; pre-bundling it breaks the worker URL in development.
    optimizeDeps: { exclude: ["maplibre-gl"] },
  },
  // The site deploys to Netlify, so generate Netlify Functions rather than a Cloudflare Worker.
  nitro: { preset: "netlify" },
});
