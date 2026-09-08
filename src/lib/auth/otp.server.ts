import { createHash, randomInt } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { normalizePhone } from "./phone";

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_ATTEMPTS = 5;
const MAX_REQUESTS_PER_HOUR = 5;

type OtpVerification = { sessionTokenHash: string };

export interface OtpProvider {
  sendOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, otp: string): Promise<OtpVerification>;
}

function hashValue(value: string) {
  const pepper = process.env["OTP_PEPPER"];
  if (!pepper) throw new Error("OTP security configuration is missing.");
  return createHash("sha256").update(`${value}:${pepper}`).digest("hex");
}

function phoneAuditHash(phone: string) {
  return hashValue(`phone:${phone}`);
}

async function audit(eventType: string, phone: string, metadata: Record<string, unknown> = {}) {
  try {
    const admin = getSupabaseAdminClient();
    await admin.from("auth_audit_log").insert({
      event_type: eventType,
      phone_hash: phoneAuditHash(phone),
      metadata,
    });
  } catch {
    // Audit availability must not disclose operational details to an auth caller.
  }
}

function developmentOtpIsExplicitlyEnabled() {
  return (
    (process.env["NODE_ENV"] === "development" || process.env["NODE_ENV"] === "test") &&
    process.env["BRICXLEY_ENABLE_DEV_OTP"] === "true"
  );
}

function developmentEmailFor(phone: string) {
  return `phone-${phone.replace(/\D/g, "")}@otp.bricxley.invalid`;
}

async function issueSupabaseSession(phone: string): Promise<OtpVerification> {
  const admin = getSupabaseAdminClient();
  const email = developmentEmailFor(phone);
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.user || !data.properties.hashed_token) {
    throw new Error("We couldn't complete phone verification. Please try again.");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ phone, phone_verified: true, last_login_at: new Date().toISOString() })
    .eq("id", data.user.id);
  if (profileError) throw new Error("We couldn't complete phone verification. Please try again.");

  await audit("OTP_VERIFIED", phone);
  return { sessionTokenHash: data.properties.hashed_token };
}

class DevelopmentOtpProvider implements OtpProvider {
  async sendOtp(rawPhone: string) {
    if (!developmentOtpIsExplicitlyEnabled()) {
      throw new Error("Development phone OTP is disabled.");
    }
    const phone = normalizePhone(rawPhone);
    const admin = getSupabaseAdminClient();
    const now = new Date();
    const { data: existing } = await admin
      .from("development_otp_challenges")
      .select("request_count, requested_window_started_at, resend_available_at")
      .eq("phone", phone)
      .maybeSingle();

    const windowStart = existing?.requested_window_started_at
      ? new Date(existing.requested_window_started_at)
      : now;
    const sameWindow = now.getTime() - windowStart.getTime() < 60 * 60 * 1000;
    const requestCount = sameWindow ? Number(existing?.request_count ?? 0) + 1 : 1;
    if (requestCount > MAX_REQUESTS_PER_HOUR) {
      await audit("OTP_REQUEST_THROTTLED", phone);
      throw new Error("Too many verification requests. Please try again in an hour.");
    }
    if (existing?.resend_available_at && new Date(existing.resend_available_at) > now) {
      throw new Error(
        `Please wait ${RESEND_COOLDOWN_SECONDS} seconds before requesting another code.`,
      );
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const { error } = await admin.from("development_otp_challenges").upsert({
      phone,
      code_hash: hashValue(`otp:${phone}:${code}`),
      attempts: 0,
      request_count: requestCount,
      requested_window_started_at: sameWindow ? windowStart.toISOString() : now.toISOString(),
      resend_available_at: new Date(now.getTime() + RESEND_COOLDOWN_SECONDS * 1000).toISOString(),
      expires_at: new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000).toISOString(),
    });
    if (error) throw new Error("We couldn't send a verification code. Please try again.");

    // This code is visible only to the local server operator. It is never sent
    // to the browser, stored in plaintext, or emitted in a production process.
    console.info(`[Bricxley development OTP] ${phone}: ${code}`);
    await audit("OTP_REQUESTED", phone, { provider: "development" });
  }

  async verifyOtp(rawPhone: string, otp: string) {
    if (!developmentOtpIsExplicitlyEnabled()) throw new Error("Development phone OTP is disabled.");
    const phone = normalizePhone(rawPhone);
    if (!/^\d{6}$/.test(otp)) throw new Error("Enter the six-digit verification code.");
    const admin = getSupabaseAdminClient();
    const { data: challenge, error } = await admin
      .from("development_otp_challenges")
      .select("code_hash, attempts, expires_at")
      .eq("phone", phone)
      .maybeSingle();
    if (error || !challenge || new Date(challenge.expires_at) <= new Date()) {
      await audit("OTP_FAILED", phone, { reason: "expired_or_missing" });
      throw new Error("This code has expired. Request a new one.");
    }
    if (Number(challenge.attempts) >= MAX_ATTEMPTS) {
      await audit("OTP_FAILED", phone, { reason: "attempt_limit" });
      throw new Error("Too many incorrect attempts. Request a new code.");
    }
    if (challenge.code_hash !== hashValue(`otp:${phone}:${otp}`)) {
      await admin
        .from("development_otp_challenges")
        .update({ attempts: Number(challenge.attempts) + 1 })
        .eq("phone", phone);
      await audit("OTP_FAILED", phone, { reason: "incorrect" });
      throw new Error("That verification code is incorrect.");
    }

    await admin.from("development_otp_challenges").delete().eq("phone", phone);
    return issueSupabaseSession(phone);
  }
}

class Msg91OtpProvider implements OtpProvider {
  private get config() {
    const authKey = process.env["MSG91_AUTH_KEY"];
    const templateId = process.env["MSG91_TEMPLATE_ID"];
    if (!authKey || !templateId) {
      throw new Error("Phone verification is temporarily unavailable. Please use Google sign-in.");
    }
    return { authKey, templateId };
  }

  async sendOtp(rawPhone: string) {
    const phone = normalizePhone(rawPhone);
    const { authKey, templateId } = this.config;
    const search = new URLSearchParams({
      authkey: authKey,
      template_id: templateId,
      mobile: phone.slice(1),
    });
    const response = await fetch(`https://control.msg91.com/api/v5/otp?${search}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("We couldn't send a verification code. Please try again.");
    await audit("OTP_REQUESTED", phone, { provider: "msg91" });
  }

  async verifyOtp(rawPhone: string, otp: string) {
    const phone = normalizePhone(rawPhone);
    const { authKey } = this.config;
    const search = new URLSearchParams({ authkey: authKey, mobile: phone.slice(1), otp });
    const response = await fetch(`https://control.msg91.com/api/v5/otp/verify?${search}`);
    if (!response.ok) {
      await audit("OTP_FAILED", phone, { reason: "provider_rejected" });
      throw new Error("That verification code is incorrect or has expired.");
    }
    return issueSupabaseSession(phone);
  }
}

function activeOtpProvider(): OtpProvider {
  if (developmentOtpIsExplicitlyEnabled()) return new DevelopmentOtpProvider();
  if (process.env["OTP_PROVIDER"] === "msg91") return new Msg91OtpProvider();
  // Deliberately no production fallback. An unconfigured provider fails closed.
  throw new Error("Phone verification is temporarily unavailable. Please use Google sign-in.");
}

export async function requestOtp(phone: string) {
  return activeOtpProvider().sendOtp(phone);
}

export async function verifyOtp(phone: string, otp: string) {
  return activeOtpProvider().verifyOtp(phone, otp);
}
