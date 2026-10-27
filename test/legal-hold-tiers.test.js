import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runGate, heldSlugs, severity } from "../lib/legal-hold.js";

const fm = (title, sources = true) => `---\ntitle: "${title}"\ndate: 2026-10-27\nsummary: "Test."\ndescription: "Test."\n${sources ? 'sources:\n  - title: "Results"\n    url: "https://www.formula1.com/en/results/2026"\n' : ""}---\n`;
function setup(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tier-"));
  const posts = path.join(root, "posts"); const review = path.join(root, "review");
  fs.mkdirSync(posts); fs.mkdirSync(review);
  for (const [n, b] of Object.entries(files)) fs.writeFileSync(path.join(posts, n), b);
  return { root, posts, review };
}
const clear = (review, sha, extra = {}) => fs.appendFileSync(path.join(review, "moderate-clearances.jsonl"), JSON.stringify({ site: "gridandpit.com", sha256: sha, fix: "added source", chatgpt_verdict: "SAFE: ok", ...extra }) + "\n");

test("severity map follows the amendment", () => {
  for (const r of [0, 1, 2, 6, 8]) assert.equal(severity(r), "HIGH");
  for (const r of [3, 4, 5, 7]) assert.equal(severity(r), "MODERATE");
});

test("MODERATE item holds until a SAFE clearance for its exact version exists", () => {
  const { posts, review } = setup({ "m.md": fm("Verstappen confirmed for 2027") + "\nThe team said so.\n" });
  let r = runGate(posts, { dir: review });
  assert.equal(r[0].severity, "MODERATE"); assert.equal(r[0].status, "HOLD_REVIEW");
  clear(review, r[0].sha256, { chatgpt_verdict: "UNSURE: unclear" });
  assert.equal(runGate(posts, { dir: review })[0].status, "HOLD_REVIEW");
  clear(review, r[0].sha256);
  r = runGate(posts, { dir: review });
  assert.equal(r[0].status, "CLEARED_MODERATE"); assert.deepEqual(heldSlugs(r), []);
  fs.appendFileSync(path.join(posts, "m.md"), "Edited later.\n");
  assert.equal(runGate(posts, { dir: review })[0].status, "HOLD_REVIEW");
});

test("HIGH item is never released by a moderate clearance", () => {
  const { posts, review } = setup({ "h.md": fm("Team news") + "\nA rival says the team committed fraud.\n" });
  const r = runGate(posts, { dir: review });
  assert.equal(r[0].severity, "HIGH");
  clear(review, r[0].sha256);
  assert.equal(runGate(posts, { dir: review })[0].status, "HOLD_REVIEW");
});

test("mixed HIGH and MODERATE is HIGH; election logistics are HIGH", () => {
  const { posts, review } = setup({ "x.md": fm("Breaking", false) + "\nPolling place hours change.\n" });
  assert.equal(runGate(posts, { dir: review })[0].severity, "HIGH");
});

function runClear(root, post, reviewer) {
  const rv = path.join(root, "rv.py"); fs.writeFileSync(rv, reviewer);
  try { return { code: 0, out: execFileSync("node", ["scripts/clear-moderate.js", post, "rule 7: headline matches source"], { encoding: "utf8", env: { ...process.env, CONTENT_REVIEW_DIR: path.join(root, "review"), CHATGPT_REVIEW: rv } }) }; }
  catch (e) { return { code: e.status, out: String(e.stdout) }; }
}
test("clear-moderate logs a clearance on SAFE and escalates otherwise", () => {
  const { root, posts, review } = setup({ "m.md": fm("Verstappen confirmed for 2027") + "\nThe team said so.\n", "h.md": fm("News") + "\nThe team committed fraud.\n" });
  const safe = 'import json;print(json.dumps({"verdict":"SAFE","reasons":["sourced"]}))';
  const unsure = 'import json,sys;print(json.dumps({"verdict":"UNSURE","reasons":["x"]}));sys.exit(1)';
  assert.equal(runClear(root, path.join(posts, "m.md"), unsure).code, 1);
  let q = fs.readFileSync(path.join(review, "queue.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
  assert.equal(q.at(-1).status, "HOLD_REVIEW");
  assert.equal(runClear(root, path.join(posts, "m.md"), safe).code, 0);
  const c = fs.readFileSync(path.join(review, "moderate-clearances.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
  for (const k of ["ts", "site", "bot", "title", "rule", "fix", "chatgpt_verdict", "sha256"]) assert.ok(k in c[0], k);
  assert.equal(runGate(posts, { dir: review }).find((r) => r.file.endsWith("m.md")).status, "CLEARED_MODERATE");
  assert.equal(runClear(root, path.join(posts, "h.md"), safe).code, 1); // HIGH never sent for self clearance
  assert.ok(!fs.readFileSync(path.join(review, "moderate-clearances.jsonl"), "utf8").includes("h.md"));
});
