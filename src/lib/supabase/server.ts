import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

function readServerConfig() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const publishableKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return { url, publishableKey };
}

function parseCookies(header: string | null) {
  if (!header) return [];
  return header.split(";").flatMap((entry) => {
    const separator = entry.indexOf("=");
    if (separator < 1) return [];
    return [{ name: entry.slice(0, separator).trim(), value: entry.slice(separator + 1).trim() }];
  });
}

function serializeCookie(name: string, value: string, options: Record<string, unknown>) {
  const parts = [`${name}=${value}`];
  if (typeof options["maxAge"] === "number") parts.push(`Max-Age=${Math.floor(options["maxAge"])}`);
  if (typeof options["domain"] === "string") parts.push(`Domain=${options["domain"]}`);
  parts.push(`Path=${typeof options["path"] === "string" ? options["path"] : "/"}`);
  if (options["httpOnly"]) parts.push("HttpOnly");
  if (options["secure"]) parts.push("Secure");
  if (typeof options["sameSite"] === "string") parts.push(`SameSite=${options["sameSite"]}`);
  if (options["sameSite"] === true) parts.push("SameSite=Strict");
  if (options["expires"] instanceof Date) parts.push(`Expires=${options["expires"].toUTCString()}`);
  return parts.join("; ");
}

/**
 * Request-scoped, cookie-backed client. Create it only inside a server
 * function; @supabase/ssr will rotate tokens and apply no-store headers.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const { url, publishableKey } = readServerConfig();
  const request = getRequest();

  return createServerClient(url, publishableKey, {
    cookieOptions: {
      name: "bricxley-auth",
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
    },
    cookies: {
      getAll: () => parseCookies(request.headers.get("cookie")),
      setAll: (cookies, headers) => {
        const values = cookies.map((cookie) =>
          serializeCookie(cookie.name, cookie.value, cookie.options as Record<string, unknown>),
        );
        if (values.length) setResponseHeader("set-cookie", values);
        for (const [name, value] of Object.entries(headers)) {
          setResponseHeader(name as never, value);
        }
      },
    },
  });
}

/** Service role is server-only and is reserved for OTP, email and audit work. */
export function getSupabaseAdminClient(): SupabaseClient {
  const { url } = readServerConfig();
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!serviceRoleKey) throw new Error("Supabase service-role configuration is missing.");
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function requireServerUser() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Please sign in to continue.");
  return { supabase, user: data.user };
}
