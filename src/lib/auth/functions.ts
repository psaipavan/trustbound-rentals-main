import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestOtp, verifyOtp } from "./otp.server";
import { normalizePhone } from "./phone";

const phoneSchema = z.object({ phone: z.string().min(1) });
const verifySchema = z.object({ phone: z.string().min(1), otp: z.string().length(6) });

export const requestPhoneOtp = createServerFn({ method: "POST" })
  .validator(phoneSchema)
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    await requestOtp(phone);
    return { phone, resendAfterSeconds: 45 };
  });

export const verifyPhoneOtp = createServerFn({ method: "POST" })
  .validator(verifySchema)
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    const result = await verifyOtp(phone, data.otp);
    return { phone, sessionTokenHash: result.sessionTokenHash };
  });
