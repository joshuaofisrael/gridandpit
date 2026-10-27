import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runGate, heldSlugs, versionHash } from "../lib/legal-hold.js";

const IMG = { hero: { src: "fixture-hero", alt: "Abstract illustration of a pit lane", caption: "Grid and Pit illustration", width: 1280, height: 720 } };
const fm = (title, extra = "") => `---\ntitle: "${title}"\ndate: 2026-10-27\ncategory: News\nsummary: "Test item."\ndescription: "Test item."\nhero:\n  src: ${IMG.hero.src}\n  alt: "${IMG.hero.alt}"\n  caption: "${IMG.hero.caption}"\n  width: 1280\n  height: 720\nsources:\n  - title: "Race result"\n    url: "https://www.formula1.com/en/results/2026"\n    publisher: "Formula 1"\n    date: 2026-10-25\n${extra}---\n`;

function setup(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hold-"));
  const posts = path.join(root, "posts"); const review = path.join(root, "review");
  fs.mkdirSync(posts); fs.mkdirSync(review);
  for (const [n, body] of Object.entries(files)) fs.writeFileSync(path.join(posts, n), body);
  return { posts, review };
}

test("hold case: allegation about an identifiable team is HOLD_REVIEW and queued once", () => {
  const { posts, review } = setup({
    "held.md": fm("Team Example accused of fraud") + "\nA rival claims Team Example committed fraud on its budget filing.\n",
    "pass.md": fm("Mexico City Grand Prix start times in ET") + "\nThe race starts at 3:00 p.m. ET on Sunday, per the official timetable.\n",
  });
  const r = runGate(posts, { dir: review });
  const held = r.find((x) => x.file.endsWith("held.md"));
  const pass = r.find((x) => x.file.endsWith("pass.md"));
  assert.equal(held.status, "HOLD_REVIEW");
  assert.ok(held.hits.some((h) => h.rule === 1));
  assert.equal(pass.status, "PASS");
  assert.deepEqual(heldSlugs(r), ["held"]);
  runGate(posts, { dir: review }); // retry must not duplicate the queue line
  const q = fs.readFileSync(path.join(review, "queue.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
  assert.equal(q.length, 1);
  for (const k of ["ts", "site", "bot", "title", "flagged", "rule", "sources", "suggestion", "draft_path"]) assert.ok(k in q[0], k);
  assert.equal(q[0].status, "HOLD_REVIEW");
});

test("approval only releases the exact approved version, and only from Joshua", () => {
  const body = fm("Team Example accused of fraud") + "\nA rival claims fraud.\n";
  const { posts, review } = setup({ "held.md": body });
  const ap = path.join(review, "approvals.jsonl");
  fs.writeFileSync(ap, JSON.stringify({ site: "gridandpit.com", sha256: versionHash(body), approved_by: "Personal assistant" }) + "\n");
  assert.equal(runGate(posts, { dir: review, writeQueue: false })[0].status, "HOLD_REVIEW");
  fs.writeFileSync(ap, JSON.stringify({ site: "gridandpit.com", sha256: versionHash(body), approved_by: "Joshua Israel" }) + "\n");
  assert.equal(runGate(posts, { dir: review, writeQueue: false })[0].status, "APPROVED");
  fs.appendFileSync(path.join(posts, "held.md"), "Another fraud claim.\n");
  assert.equal(runGate(posts, { dir: review, writeQueue: false })[0].status, "HOLD_REVIEW");
});

test("unlicensed image, missing source, election wording and legal flags are held", () => {
  const { posts, review } = setup({
    "img.md": fm("Start times").replace("fixture-hero", "random-web-photo") + "\nTimes.\n",
    "nosrc.md": fm("Start times").replace(/sources:[\s\S]*?(?=---)/, "") + "\nTimes.\n",
    "vote.md": fm("Start times") + "\nRegister to vote by Friday.\n",
    "legal.md": fm("Start times", "legalNotice: \"rights complaint received\"\n") + "\nTimes.\n",
  });
  const r = Object.fromEntries(runGate(posts, { dir: review, writeQueue: false }).map((x) => [path.basename(x.file), x]));
  assert.ok(r["img.md"].hits.some((h) => h.rule === 3));
  assert.ok(r["nosrc.md"].hits.some((h) => h.rule === 4));
  assert.ok(r["vote.md"].hits.some((h) => h.rule === 6));
  assert.ok(r["legal.md"].hits.some((h) => h.rule === 8));
});
