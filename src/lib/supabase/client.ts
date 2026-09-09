import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

export function isSupabaseConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
}

/**
 * Browser access is limited to the Supabase publishable key. Sessions use
 * cookie storage through @supabase/ssr instead of localStorage.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Bricxley authentication is not configured. Please contact support.");
  }

  browserClient ??= createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        name: "bricxley-auth",
        sameSite: "lax",
        secure: import.meta.env.PROD,
      },
    },
  );

  return browserClient;
}
