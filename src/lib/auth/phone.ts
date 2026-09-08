const E164_PHONE = /^\+[1-9]\d{7,14}$/;

/** Normalizes Indian input to E.164 and rejects every ambiguous value. */
export function normalizePhone(input: string) {
  let compact = input.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("00")) compact = `+${compact.slice(2)}`;
  if (/^0\d{10}$/.test(compact)) compact = compact.slice(1);
  if (/^091\d{10}$/.test(compact)) compact = compact.slice(1);
  if (/^\d{10}$/.test(compact)) compact = `+91${compact}`;
  if (/^91\d{10}$/.test(compact)) compact = `+${compact}`;

  if (!E164_PHONE.test(compact)) {
    throw new Error("Enter a valid mobile number, including its country code.");
  }
  return compact;
}

export function isNormalizedPhone(value: string) {
  return E164_PHONE.test(value);
}
