import { expect, test } from "vitest";
import { selectOwnerInterestTab } from "./OwnerInterestList";
import type { Interest } from "@/lib/workflow/types";

const interest = (status: Interest["status"]): Interest => ({
  id: status,
  propertyId: "br-001",
  tenantId: "u-tenant-demo",
  tenantName: "Sai",
  listerId: "u-anita",
  moveInDate: "2026-10-01",
  occupants: 1,
  occupationType: "Working Professional",
  status,
  createdAt: "2026-09-18T10:00:00.000Z",
  updatedAt: "2026-09-18T10:00:00.000Z",
});

test("groups owner interests into actionable, matched, and closed queues", () => {
  const interests = [interest("SUBMITTED"), interest("ACCEPTED"), interest("DECLINED")];

  expect(selectOwnerInterestTab(interests, "pending").map((item) => item.status)).toEqual([
    "SUBMITTED",
  ]);
  expect(selectOwnerInterestTab(interests, "matched").map((item) => item.status)).toEqual([
    "ACCEPTED",
  ]);
  expect(selectOwnerInterestTab(interests, "closed").map((item) => item.status)).toEqual([
    "DECLINED",
  ]);
});
