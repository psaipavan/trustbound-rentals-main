import { expect, test } from "vitest";
import { selectInterestTab } from "./InterestCard";
import type { Interest } from "@/lib/workflow/types";

const interest = (id: string, status: Interest["status"]): Interest => ({
  id,
  propertyId: "br-001",
  tenantId: "u-tenant-demo",
  tenantName: "Sai",
  listerId: "u-anita",
  moveInDate: "2026-10-01",
  occupants: 2,
  occupationType: "Working Professional",
  leasePreference: "11 months",
  message: "Quiet household",
  status,
  createdAt: "2026-09-04T10:00:00.000Z",
  updatedAt: "2026-09-04T10:00:00.000Z",
});

test("keeps a closed request out of a tenant's active interest tabs", () => {
  const interests = [
    interest("interest-submitted", "SUBMITTED"),
    interest("interest-accepted", "ACCEPTED"),
    interest("interest-declined", "DECLINED"),
  ];

  expect(selectInterestTab(interests, "pending").map((item) => item.id)).toEqual([
    "interest-submitted",
  ]);
  expect(selectInterestTab(interests, "matched").map((item) => item.id)).toEqual([
    "interest-accepted",
  ]);
  expect(selectInterestTab(interests, "closed").map((item) => item.id)).toEqual([
    "interest-declined",
  ]);
});
