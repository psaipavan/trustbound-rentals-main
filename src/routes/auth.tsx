import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, KeyRound, Smartphone, UserRound } from "lucide-react";
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
  { key: "tenant", label: "Find a Home", icon: UserRound, text: "I’m looking for a home" },
  { key: "owner", label: "List My Property", icon: KeyRound, text: "I’m listing my property" },
  { key: "agent", label: "I’m an Agent", icon: Building2, text: "I represent an agency" },
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
  const { account, isReady, isConfigured, enableRole, signInWithGoogle, completePhoneSignIn } =
    useSession();
  const [role, setRole] = useState<AuthRole>(search.role ?? "tenant");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [busy, setBusy] = useState<"phone" | "verify" | "google" | "role" | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const callbackHandled = useRef(false);
  const destination = getSafeRedirect(search.redirect) ?? dashboardForRole(role);

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= resendAt) setResendAt(null);
    }, 500);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  const finishSignIn = async () => {
    setBusy("role");
    try {
      await enableRole(role);
      toast.success("Welcome to Bricxley");
      await navigate({ to: destination });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't finish sign-in.");
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (!search.oauth || !account || callbackHandled.current) return;
    callbackHandled.current = true;
    void finishSignIn();
    // The OAuth callback must be completed exactly once after the session arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, search.oauth]);

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
      await finishSignIn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't verify that code.");
    } finally {
      setBusy(null);
    }
  };

  const startGoogle = async () => {
    setBusy("google");
    try {
      await signInWithGoogle(role, getSafeRedirect(search.redirect));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in could not be started.");
      setBusy(null);
    }
  };

  const secondsRemaining = resendAt ? Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)) : 0;

  return (
    <div className="gradient-hero min-h-[80vh] py-16">
      <div className="container-page">
        <div className="mx-auto max-w-md">
          <div className="surface-card p-7 shadow-[var(--shadow-panel)]">
            <BricxleyLogo showTagline />
            <h1 className="mt-7 text-2xl font-extrabold">Welcome to Bricxley</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {account
                ? "Choose how you’d like to use Bricxley. You can add another role later."
                : "Sign in to save homes, express interest and schedule visits."}
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {roles.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRole(item.key)}
                  aria-pressed={role === item.key}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition",
                    role === item.key
                      ? "border-primary bg-primary/8"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      role === item.key ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <p className="mt-1.5 text-sm font-bold">{item.label}</p>
                  <p className="text-[0.7rem] leading-tight text-muted-foreground">{item.text}</p>
                </button>
              ))}
            </div>

            {account ? (
              <Button
                className="mt-6 w-full"
                onClick={() => void finishSignIn()}
                disabled={busy !== null}
              >
                {busy === "role" ? "Preparing your account…" : `Continue as ${role}`}
              </Button>
            ) : otpStep ? (
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Enter verification code</Label>
                  <p className="text-xs text-muted-foreground">Sent to {phone}</p>
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
                  {busy === "verify" ? "Verifying…" : "Verify and continue"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => void sendOtp()}
                  disabled={busy !== null || secondsRemaining > 0}
                >
                  {secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : "Resend code"}
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Mobile number</Label>
                  <div className="flex gap-2">
                    <span className="inline-flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="98765 43210"
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
                  {busy === "phone" ? "Sending OTP…" : "Continue"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your phone is used for sign-in and remains private until you explicitly share it.
                </p>
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
