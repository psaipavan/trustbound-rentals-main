import { expect, test } from "vitest";
import { workflowKeys } from "./query";

test("scopes tenant cache keys to the affected workflow record", () => {
  expect(workflowKeys.tenantInterests("u-tenant-demo")).toEqual([
    "tenant-interests",
    "u-tenant-demo",
  ]);
});

test("keeps protected interest and conversation data isolated by account", () => {
  expect(workflowKeys.interest("u-tenant-demo", "interest-42")).toEqual([
    "interest",
    "u-tenant-demo",
    "interest-42",
  ]);
  expect(workflowKeys.conversation("u-tenant-demo", "conversation-42")).not.toEqual(
    workflowKeys.conversation("u-anita", "conversation-42"),
  );
});
