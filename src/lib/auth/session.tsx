import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WorkflowError, type WorkflowActor, type WorkflowRole } from "@/lib/workflow/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const roles: WorkflowRole[] = ["tenant", "owner", "agent", "admin"];
const previewRoles = ["tenant", "owner", "agent"] as const;
const previewSessionKey = "bricxley-local-preview-session";

type Account = {
  id: string;
  displayName: string;
  roles: WorkflowRole[];
};

type PreviewRole = (typeof previewRoles)[number];

type PreviewSession = {
  id: string;
  displayName: string;
  roles: PreviewRole[];
  activeRole: PreviewRole;
};

type SessionContextValue = {
  account: Account | null;
  actor: WorkflowActor | null;
  isReady: boolean;
  isConfigured: boolean;
  canUseLocalPreview: boolean;
  startLocalPreview: (role: Exclude<WorkflowRole, "admin">) => Promise<void>;
  signInWithGoogle: (role: Exclude<WorkflowRole, "admin">, redirect?: string) => Promise<void>;
  completePhoneSignIn: (sessionTokenHash: string) => Promise<void>;
  enableRole: (role: Exclude<WorkflowRole, "admin">) => Promise<void>;
  switchRole: (role: WorkflowRole) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function isPreviewRole(value: unknown): value is PreviewRole {
  return typeof value === "string" && previewRoles.includes(value as PreviewRole);
}

function readPreviewSession(): PreviewSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(previewSessionKey);
    if (!stored) return null;
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== "object") return null;
    const session = value as Partial<PreviewSession>;
    const sessionRoles = Array.isArray(session.roles) ? session.roles.filter(isPreviewRole) : [];
    if (
      typeof session.id !== "string" ||
      typeof session.displayName !== "string" ||
      !isPreviewRole(session.activeRole) ||
      !sessionRoles.includes(session.activeRole)
    ) {
      return null;
    }
    return { ...session, roles: sessionRoles, activeRole: session.activeRole };
  } catch {
    return null;
  }
}

function savePreviewSession(session: PreviewSession) {
  window.sessionStorage.setItem(previewSessionKey, JSON.stringify(session));
}

function clearPreviewSession() {
  window.sessionStorage.removeItem(previewSessionKey);
}

function applyPreviewSession(
  session: PreviewSession,
  setAccount: (account: Account) => void,
  setActor: (actor: WorkflowActor) => void,
) {
  const account = {
    id: session.id,
    displayName: session.displayName,
    roles: session.roles,
  };
  setAccount(account);
  setActor({ ...account, role: session.activeRole });
}

function toRole(value: unknown): WorkflowRole | null {
  return typeof value === "string" && roles.includes(value as WorkflowRole)
    ? (value as WorkflowRole)
    : null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [actor, setActor] = useState<WorkflowActor | null>(null);
  const [isReady, setIsReady] = useState(false);
  const configured = isSupabaseConfigured();
  const canUseLocalPreview = !configured && import.meta.env.DEV;

  const refresh = useCallback(async () => {
    if (!configured) {
      const preview = canUseLocalPreview ? readPreviewSession() : null;
      if (preview) applyPreviewSession(preview, setAccount, setActor);
      else {
        setAccount(null);
        setActor(null);
      }
      setIsReady(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setAccount(null);
      setActor(null);
      setIsReady(true);
      return;
    }

    const user = userData.user;
    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name,last_active_role")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    const availableRoles = ((roleRows ?? []) as Array<{ role: unknown }>)
      .map((row: { role: unknown }) => toRole(row.role))
      .filter((role: WorkflowRole | null): role is WorkflowRole => role !== null);
    const activeRole = toRole(profile?.last_active_role);
    const role = activeRole && availableRoles.includes(activeRole) ? activeRole : availableRoles[0];
    const displayName =
      profile?.full_name ||
      (typeof user.user_metadata["full_name"] === "string"
        ? user.user_metadata["full_name"]
        : null) ||
      (typeof user.user_metadata["name"] === "string" ? user.user_metadata["name"] : null) ||
      user.email?.split("@")[0] ||
      "Bricxley member";
    const nextAccount = { id: user.id, displayName, roles: availableRoles };
    setAccount(nextAccount);
    setActor(role ? { ...nextAccount, role } : null);
    setIsReady(true);
  }, [canUseLocalPreview, configured]);

  useEffect(() => {
    void refresh();
    if (!configured) return;
    const { data } = getSupabaseBrowserClient().auth.onAuthStateChange(() => {
      window.setTimeout(() => void refresh(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [configured, refresh]);

  const value = useMemo<SessionContextValue>(
    () => ({
      account,
      actor,
      isReady,
      isConfigured: configured,
      canUseLocalPreview,
      startLocalPreview: async (role) => {
        if (!canUseLocalPreview) {
          throw new Error("Local preview is only available while running the development server.");
        }
        const session: PreviewSession = {
          id: "local-preview-user",
          displayName: "Preview user",
          roles: [role],
          activeRole: role,
        };
        savePreviewSession(session);
        applyPreviewSession(session, setAccount, setActor);
        setIsReady(true);
      },
      signInWithGoogle: async (role, redirect) => {
        const supabase = getSupabaseBrowserClient();
        const callback = new URL("/auth", window.location.origin);
        callback.searchParams.set("oauth", "1");
        callback.searchParams.set("role", role);
        if (redirect) callback.searchParams.set("redirect", redirect);
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: callback.toString() },
        });
        if (error || !data.url) throw new Error("Google sign-in could not be started.");
        window.location.assign(data.url);
      },
      completePhoneSignIn: async (sessionTokenHash) => {
        const { error } = await getSupabaseBrowserClient().auth.verifyOtp({
          token_hash: sessionTokenHash,
          type: "magiclink",
        });
        if (error) throw new Error("We couldn't create your secure session. Please try again.");
        await refresh();
      },
      enableRole: async (role) => {
        if (!configured) {
          const current = readPreviewSession();
          if (!current) throw new Error("Start a local preview before choosing a role.");
          const nextRoles = current.roles.includes(role) ? current.roles : [...current.roles, role];
          const next = { ...current, roles: nextRoles };
          savePreviewSession(next);
          applyPreviewSession(next, setAccount, setActor);
          return;
        }
        const { error } = await getSupabaseBrowserClient().rpc("enable_my_role", {
          requested_role: role,
        });
        if (error) throw new Error("We couldn't update your Bricxley role. Please try again.");
        await refresh();
      },
      switchRole: async (role) => {
        if (!account?.roles.includes(role))
          throw new Error("That role is not enabled for this account.");
        if (!configured) {
          const current = readPreviewSession();
          if (!current || !isPreviewRole(role))
            throw new Error("That role is not available in this local preview.");
          const next = { ...current, activeRole: role };
          savePreviewSession(next);
          applyPreviewSession(next, setAccount, setActor);
          return;
        }
        const { error } = await getSupabaseBrowserClient()
          .from("profiles")
          .update({ last_active_role: role })
          .eq("id", account.id);
        if (error) throw new Error("We couldn't switch roles. Please try again.");
        await refresh();
      },
      signOut: async () => {
        if (configured) await getSupabaseBrowserClient().auth.signOut();
        else clearPreviewSession();
        setAccount(null);
        setActor(null);
        setIsReady(true);
      },
      refresh,
    }),
    [account, actor, canUseLocalPreview, configured, isReady, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used within SessionProvider");
  return session;
}

export function requireRole(
  actor: WorkflowActor | null,
  role: WorkflowRole | readonly WorkflowRole[],
): WorkflowActor {
  if (!actor) throw new WorkflowError("UNAUTHENTICATED", "Please sign in to continue.");
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(actor.role)) {
    throw new WorkflowError("UNAUTHORIZED", "This account cannot access that page.");
  }
  return actor;
}

export function dashboardForRole(role: WorkflowRole) {
  return `/dashboard/${role === "admin" ? "owner" : role}` as const;
}
