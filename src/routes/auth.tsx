import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, CheckCircle2, KeyRound, Smartphone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { BricxleyLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/auth/functions";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const roles = [
  {
    key: "tenant",
    label: "Find a Home",
    icon: UserRound,
    text: "I’m a tenant looking for a rental property.",
  },
  {
    key: "owner",
    label: "List My Property",
    icon: KeyRound,
    text: "I’m a property owner looking for tenants.",
  },
  {
    key: "agent",
    label: "I’m an Agent",
    icon: Building2,
    text: "I help people find or list properties.",
  },
] as const;

type AuthRole = (typeof roles)[number]["key"];
type AuthSearch = { redirect?: string; role?: AuthRole; oauth?: boolean };

export function getSafeRedirect(redirect: string | undefined) {
  return redirect?.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("\\")
    ? redirect
    : undefined;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    ...(typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {}),
    ...(roles.some((role) => role.key === search["role"])
      ? { role: search["role"] as AuthRole }
      : {}),
    ...(search["oauth"] === "1" || search["oauth"] === true ? { oauth: true } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Log in or join Bricxley" },
      {
        name: "description",
        content: "Sign in to Bricxley with your mobile number or Google account.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/auth" });
  const {
    account,
    isReady,
    isConfigured,
    enableRole,
    switchRole,
    signInWithGoogle,
    completePhoneSignIn,
  } = useSession();
  const requestedRole = search.role ?? "tenant";
  const [selectedRoles, setSelectedRoles] = useState<AuthRole[]>([requestedRole]);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [busy, setBusy] = useState<"phone" | "verify" | "google" | "role" | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const primaryRole = selectedRoles[0] ?? requestedRole;
  const destination = getSafeRedirect(search.redirect) ?? dashboardForRole(primaryRole);

  useEffect(() => {
    if (!account?.roles.length) return;
    const actualRoles = account.roles.filter(
      (role): role is AuthRole => role === "tenant" || role === "owner" || role === "agent",
    );
    if (actualRoles.length) setSelectedRoles(actualRoles);
  }, [account?.id, account?.roles]);

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= resendAt) setResendAt(null);
    }, 500);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  const toggleRole = (role: AuthRole) => {
    setSelectedRoles((current) => {
      if (current.includes(role))
        return current.length > 1 ? current.filter((item) => item !== role) : current;
      return [...current, role];
    });
  };

  const finishRoleSelection = async () => {
    if (!selectedRoles.length) {
      toast.error("Choose at least one way to use Bricxley.");
      return;
    }
    setBusy("role");
    try {
      const existingRoles = account?.roles ?? [];
      const rolesToEnable = selectedRoles.filter((role) => !existingRoles.includes(role));
      const primaryIsNew = rolesToEnable.includes(primaryRole);
      const orderedRoles = primaryIsNew
        ? [...rolesToEnable.filter((role) => role !== primaryRole), primaryRole]
        : rolesToEnable;
      for (const role of orderedRoles) await enableRole(role);
      if (!primaryIsNew && existingRoles.includes(primaryRole)) await switchRole(primaryRole);
      toast.success("Welcome to Bricxley");
      await navigate({ to: destination });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't finish setting up your account.",
      );
    } finally {
      setBusy(null);
    }
  };

  const sendOtp = async () => {
    setBusy("phone");
    try {
      const result = await requestPhoneOtp({ data: { phone } });
      setPhone(result.phone);
      setOtpStep(true);
      setResendAt(Date.now() + result.resendAfterSeconds * 1000);
      toast.success("Verification code sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't send a verification code.");
    } finally {
      setBusy(null);
    }
  };

  const verifyCode = async () => {
    setBusy("verify");
    try {
      const result = await verifyPhoneOtp({ data: { phone, otp } });
      await completePhoneSignIn(result.sessionTokenHash);
      toast.success("Phone verified. Choose your Bricxley roles.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't verify that code.");
    } finally {
      setBusy(null);
    }
  };

  const startGoogle = async () => {
    setBusy("google");
    try {
      await signInWithGoogle(requestedRole, getSafeRedirect(search.redirect));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in could not be started.");
      setBusy(null);
    }
  };

  const secondsRemaining = resendAt ? Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)) : 0;
  const showRoleSelection = Boolean(account);

  return (
    <div className="gradient-hero min-h-[80vh] py-10 sm:py-16">
      <div className="container-page">
        <div className="mx-auto max-w-md">
          <div className="surface-card p-6 shadow-[var(--shadow-panel)] sm:p-7">
            <BricxleyLogo showTagline />

            {showRoleSelection ? (
              <section className="mt-7">
                <h1 className="text-2xl font-extrabold">How would you like to use Bricxley?</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  You can select multiple roles and switch anytime.
                </p>
                <div className="mt-6 grid gap-3">
                  {roles.map((item) => {
                    const selected = selectedRoles.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleRole(item.key)}
                        aria-pressed={selected}
                        className={cn(
                          "relative rounded-xl border p-4 text-left transition",
                          selected
                            ? "border-primary bg-primary/8 shadow-[var(--shadow-soft)]"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-primary">
                            <item.icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-bold">{item.label}</span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {item.text}
                            </span>
                          </span>
                        </div>
                        {selected ? (
                          <CheckCircle2
                            className="absolute right-3 top-3 h-5 w-5 text-primary"
                            aria-label="Selected"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => void finishRoleSelection()}
                  disabled={busy !== null}
                >
                  {busy === "role" ? "Preparing your account…" : "Continue"}
                </Button>
              </section>
            ) : otpStep ? (
              <section className="mt-7 space-y-5">
                <div>
                  <h1 className="text-2xl font-extrabold">Verify OTP</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;ve sent a 6-digit code to {phone}.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Verification code</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={busy !== null}>
                    <InputOTPGroup>
                      {Array.from({ length: 6 }, (_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  className="w-full"
                  onClick={() => void verifyCode()}
                  disabled={otp.length !== 6 || busy !== null}
                >
                  {busy === "verify" ? "Verifying…" : "Verify & Continue"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => void sendOtp()}
                  disabled={busy !== null || secondsRemaining > 0}
                >
                  {secondsRemaining > 0 ? `Resend OTP in ${secondsRemaining}s` : "Resend OTP"}
                </Button>
              </section>
            ) : (
              <section className="mt-7">
                <h1 className="text-2xl font-extrabold">Welcome Back</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to continue to your account.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="flex gap-2">
                      <span className="inline-flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="Enter your mobile number"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        disabled={!isConfigured || busy !== null}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => void sendOtp()}
                    disabled={!phone || !isConfigured || busy !== null}
                  >
                    <Smartphone className="h-4 w-4" />
                    {busy === "phone" ? "Sending OTP…" : "Send OTP"}
                  </Button>
                  <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or{" "}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => void startGoogle()}
                    disabled={!isConfigured || busy !== null}
                  >
                    <span aria-hidden className="font-bold text-[#4285f4]">
                      G
                    </span>
                    {busy === "google" ? "Signing in…" : "Continue with Google"}
                  </Button>
                </div>
                <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <a className="underline hover:text-foreground" href="/legal/terms">
                    Terms
                  </a>{" "}
                  &amp;{" "}
                  <a className="underline hover:text-foreground" href="/legal/privacy">
                    Privacy Policy
                  </a>
                  .
                </p>
              </section>
            )}

            {!isReady ? (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Checking your session…
              </p>
            ) : null}
            {!isConfigured ? (
              <p className="mt-4 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
                Authentication is not configured for this environment yet.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
