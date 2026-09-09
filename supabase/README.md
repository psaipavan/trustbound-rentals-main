# Supabase setup

1. Create and link a Supabase project: `supabase link --project-ref <project-ref>`.
2. Apply [the migration](migrations/202609080001_bricxley_auth_and_workflow.sql) with `supabase db push`.
3. In Supabase Auth, enable Google and set the callback URL to `https://<your-domain>/auth` (plus the local URL).
4. Set the values from `.env.example` in Netlify. Only the two `VITE_` variables are browser-safe.
5. For local/test phone OTP only, set `BRICXLEY_ENABLE_DEV_OTP=true`, an `OTP_PEPPER`, and the server-only Supabase service-role key. Never set this flag in production.
6. Verify row-level security in a disposable local/linked project with `supabase test db`.

The migration creates all role, profile, property, saved-home, interest, match, conversation, message, visit, consent, notification and audit tables with RLS enabled. The service-role key is used only inside TanStack Start server functions for OTP, audit and email delivery.
