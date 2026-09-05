import { expect, test } from "vitest";
import { getNextGalleryIndex } from "./PropertyGallery";

test("wraps gallery navigation in both directions without leaving valid image indexes", () => {
  expect(getNextGalleryIndex(3, 4, "next")).toBe(0);
  expect(getNextGalleryIndex(0, 4, "previous")).toBe(3);
  expect(getNextGalleryIndex(0, 1, "next")).toBe(0);
});
