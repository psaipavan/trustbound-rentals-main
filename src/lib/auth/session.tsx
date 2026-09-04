import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { WorkflowError, type WorkflowActor, type WorkflowRole } from "@/lib/workflow/types";

const SESSION_STORAGE_KEY = "bricxley.session.v1";

const demoActors: Record<WorkflowRole, WorkflowActor> = {
  tenant: { id: "u-tenant-demo", role: "tenant", displayName: "Sai" },
  owner: { id: "u-anita", role: "owner", displayName: "A. Reddy" },
  agent: { id: "u-agent-demo", role: "agent", displayName: "Bricxley Agent" },
};

type SessionContextValue = {
  actor: WorkflowActor | null;
  isReady: boolean;
  signIn: (role: WorkflowRole) => WorkflowActor;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredActor(): WorkflowActor | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const candidate: unknown = JSON.parse(stored);
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "id" in candidate &&
      "role" in candidate &&
      "displayName" in candidate &&
      typeof candidate.id === "string" &&
      (candidate.role === "tenant" || candidate.role === "owner" || candidate.role === "agent") &&
      typeof candidate.displayName === "string"
    ) {
      return candidate as WorkflowActor;
    }
  } catch {
    // A malformed prototype session is treated as signed out.
  }

  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<WorkflowActor | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setActor(readStoredActor());
    setIsReady(true);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      actor,
      isReady,
      signIn: (role) => {
        const nextActor = demoActors[role];
        setActor(nextActor);
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextActor));
        return nextActor;
      },
      signOut: () => {
        setActor(null);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      },
    }),
    [actor, isReady],
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
  return `/dashboard/${role}` as const;
}
