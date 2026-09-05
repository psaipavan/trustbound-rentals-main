import { expect, test } from "vitest";
import {
  getInitialInterestDraft,
  getInterestSubmitLabel,
  interestDraftSchema,
} from "./InterestWizard";

test("rejects malformed draft details before an interest can reach the service", () => {
  const validDraft = {
    moveInDate: "2026-10-01",
    occupants: 2,
    occupationType: "Student",
    leasePreference: "",
    message: "",
  };

  expect(interestDraftSchema.safeParse(validDraft).success).toBe(true);
  expect(interestDraftSchema.safeParse({ ...validDraft, moveInDate: "" }).success).toBe(false);
  expect(interestDraftSchema.safeParse({ ...validDraft, occupants: 0 }).success).toBe(false);
  expect(interestDraftSchema.safeParse({ ...validDraft, occupationType: "" }).success).toBe(false);
});

test("prefers this home's saved draft over non-sensitive values from the latest active interest", () => {
  const priorInterest = {
    moveInDate: "2026-10-01",
    occupants: 2,
    occupationType: "Student" as const,
    leasePreference: "11 months",
    message: "Prior message should not be reused",
  };

  expect(getInitialInterestDraft(undefined, priorInterest)).toMatchObject({
    moveInDate: "2026-10-01",
    occupants: 2,
    occupationType: "Student",
    leasePreference: "11 months",
    message: "",
  });
  expect(
    getInitialInterestDraft(
      { moveInDate: "2026-11-01", message: "Use this property-specific note" },
      priorInterest,
    ),
  ).toMatchObject({
    moveInDate: "2026-11-01",
    occupants: 2,
    occupationType: "Student",
    leasePreference: "11 months",
    message: "Use this property-specific note",
  });
});

test("keeps the interest action label stable while the submission is pending", () => {
  expect(getInterestSubmitLabel(false)).toBe("Send Interest");
  expect(getInterestSubmitLabel(true)).toBe("Sending…");
});
