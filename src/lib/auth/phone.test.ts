import { describe, expect, test } from "vitest";
import { isNormalizedPhone, normalizePhone } from "./phone";

describe("phone normalization", () => {
  test("normalizes common Indian mobile formats to E.164", () => {
    expect(normalizePhone("98765 43210")).toBe("+919876543210");
    expect(normalizePhone("+91 98765-43210")).toBe("+919876543210");
    expect(normalizePhone("0919876543210")).toBe("+919876543210");
  });

  test("rejects ambiguous and invalid phone values", () => {
    expect(() => normalizePhone("1234")).toThrow("valid mobile number");
    expect(() => normalizePhone("+91987654321000000")).toThrow("valid mobile number");
    expect(isNormalizedPhone("9876543210")).toBe(false);
    expect(isNormalizedPhone("+919876543210")).toBe(true);
  });
});
