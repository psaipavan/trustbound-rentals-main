import { expect, test } from "vitest";
import { getSafeRedirect } from "./auth";

test("accepts only same-site path redirects after authentication", () => {
  expect(getSafeRedirect("/property/br-001/interest")).toBe("/property/br-001/interest");
  expect(getSafeRedirect("//attacker.example")).toBeUndefined();
  expect(getSafeRedirect("/\\attacker.example")).toBeUndefined();
  expect(getSafeRedirect("https://attacker.example")).toBeUndefined();
});
