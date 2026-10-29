import { test } from "node:test";
import assert from "node:assert/strict";
import { isAwaitingPublish } from "../lib/dates.js";

const slot = "2026-10-29T15:00:00.000Z";

test("publishAt stays unpublished until that instant and absent means publish now", () => {
  const before = Date.parse("2026-10-29T14:59:59.000Z");
  const at = Date.parse("2026-10-29T15:00:00.000Z");
  assert.equal(isAwaitingPublish(slot, before), true);
  assert.equal(isAwaitingPublish(slot, at), false);
  assert.equal(isAwaitingPublish(undefined, at), false);
  assert.equal(isAwaitingPublish("", at), false);
});
