import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, KeyRound, Mail, Smartphone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { BricxleyLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { dashboardForRole, useSession } from "@/lib/auth/session";

const roles = [
  { key: "tenant", label: "Tenant", icon: UserRound, text: "I’m looking for a home" },
  { key: "owner", label: "Owner", icon: KeyRound, text: "I’m listing my property" },
  { key: "agent", label: "Agent", icon: Building2, text: "I represent an agency" },
] as const;

type AuthSearch = { redirect?: string };

export function getSafeRedirect(redirect: string | undefined) {
  return redirect?.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("\\")
    ? redirect
    : undefined;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "Log in or join Bricxley" },
      {
        name: "description",
        content:
          "Sign in to Bricxley as a tenant, owner or verified agent to save homes, chat securely and schedule visits.",
      },
      { property: "og:title", content: "Log in or join Bricxley" },
      {
        property: "og:description",
        content: "Choose your role and continue with email, phone OTP or Google.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [role, setRole] = useState<(typeof roles)[number]["key"]>("tenant");
  const { signIn } = useSession();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/auth" });

  const continueAsRole = () => {
    signIn(role);
    const destination = getSafeRedirect(search.redirect) ?? dashboardForRole(role);
    toast.success(`Signed in as ${role}`);
    void navigate({ to: destination });
  };

  return (
    <div className="gradient-hero min-h-[80vh] py-16">
      <div className="container-page">
        <div className="mx-auto max-w-md">
          <div className="surface-card p-7 shadow-[var(--shadow-panel)]">
            <BricxleyLogo showTagline />

            <h1 className="mt-7 text-2xl font-extrabold">Welcome to Bricxley</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Choose your role, then continue. You can change this later in your profile.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {roles.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  aria-pressed={role === r.key}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition",
                    role === r.key
                      ? "border-primary bg-primary/8"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <r.icon
                    className={cn(
                      "h-4 w-4",
                      role === r.key ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <p className="mt-1.5 text-sm font-bold">{r.label}</p>
                  <p className="text-[0.7rem] leading-tight text-muted-foreground">{r.text}</p>
                </button>
              ))}
            </div>

            <Tabs defaultValue="email" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">
                  <Mail className="h-3.5 w-3.5" /> Email
                </TabsTrigger>
                <TabsTrigger value="phone">
                  <Smartphone className="h-3.5 w-3.5" /> Phone OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full" onClick={continueAsRole}>
                  Continue as {role}
                </Button>
              </TabsContent>

              <TabsContent value="phone" className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Mobile number</Label>
                  <Input id="phone" type="tel" placeholder="+91 98XXX XXXXX" />
                </div>
                <Button className="w-full" onClick={continueAsRole}>
                  Send OTP
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your number is used for sign-in only. It is never shown on listings or shared with
                  other users automatically.
                </p>
              </TabsContent>
            </Tabs>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or{" "}
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full" onClick={continueAsRole}>
              Continue with Google
            </Button>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Preview your dashboard:{" "}
              <Link to="/dashboard/tenant" className="font-medium text-primary hover:underline">
                Tenant
              </Link>
              {" · "}
              <Link to="/dashboard/owner" className="font-medium text-primary hover:underline">
                Owner
              </Link>
              {" · "}
              <Link to="/dashboard/agent" className="font-medium text-primary hover:underline">
                Agent
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
