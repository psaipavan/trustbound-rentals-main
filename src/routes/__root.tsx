import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/layout/Navbar";
import { WorkflowNavbar } from "@/components/layout/WorkflowNavbar";
import { Footer } from "@/components/layout/Footer";
import { CompareDrawer } from "@/components/property/CompareDrawer";
import { BoundAiLauncher } from "@/components/ai/BoundAi";
import { SavedProvider } from "@/lib/saved-store";
import { SessionProvider } from "@/lib/auth/session";
import { useSession } from "@/lib/auth/session";
import { BRAND } from "@/lib/brand";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BRAND.name} — Verified rentals in Hyderabad` },
      {
        name: "description",
        content: `${BRAND.name} is a trusted rental marketplace connecting tenants, owners and verified agents. Rent with clarity.`,
      },
      { name: "author", content: BRAND.name },
      { name: "application-name", content: BRAND.name },
      { property: "og:site_name", content: BRAND.name },
      { property: "og:type", content: "website" },
      { property: "og:title", content: `${BRAND.name} — Find a Home You Can Trust` },
      { property: "og:description", content: BRAND.description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${BRAND.name} — Find a Home You Can Trust` },
      { name: "twitter:description", content: BRAND.description },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SavedProvider>
          <div className="flex min-h-screen flex-col">
            <ApplicationNavigation />
            <main className="flex-1">
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            <Footer />
          </div>
          <CompareDrawer />
          <BoundAiLauncher />
          <Toaster position="top-center" />
        </SavedProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

function ApplicationNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { actor, isReady } = useSession();
  const isTenantWorkflow =
    actor?.role === "tenant" &&
    (pathname.startsWith("/tenant/") || /^\/property\/[^/]+\/interest\/?$/.test(pathname));
  const isOwnerWorkflow = actor?.role === "owner" && pathname.startsWith("/owner/");

  if (isReady && (isTenantWorkflow || isOwnerWorkflow) && actor) {
    return <WorkflowNavbar role={actor.role === "owner" ? "owner" : "tenant"} />;
  }

  return <Navbar />;
}
