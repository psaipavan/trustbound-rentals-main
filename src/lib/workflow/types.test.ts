import { expect, test } from "vitest";
import { interestStatusGroups } from "./types";

test("groups submitted, accepted, and closed interests for their compact tabs", () => {
  expect(interestStatusGroups.pending).toEqual(["SUBMITTED"]);
  expect(interestStatusGroups.matched).toEqual(["ACCEPTED"]);
  expect(interestStatusGroups.closed).toEqual(["DECLINED", "WITHDRAWN", "EXPIRED"]);
});
