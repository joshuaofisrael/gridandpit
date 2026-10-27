#!/usr/bin/env node
// Usage: node scripts/clear-moderate.js <post.md> "<rule + fix made>"
// AMENDMENT tiers: only MODERATE items (no HIGH hits) may be cleared here. The fix must already
// be made in the file (add source, attribute, swap or credit image; not mere softening).
// ChatGPT reviews independently; SAFE logs a clearance for this exact sha256, otherwise the
// item is escalated to HOLD_REVIEW for Joshua in queue.jsonl.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { checkPost, severity, REVIEW_DIR, SITE, BOT, CLEARANCES } from "../lib/legal-hold.js";
const [file, fix] = process.argv.slice(2);
if (!file || !fix) { console.error("usage: clear-moderate.js <post.md> \"<rule + fix>\""); process.exit(2); }
const dir = REVIEW_DIR;
const lic = fs.existsSync("src/_data/image-licences.json") ? JSON.parse(fs.readFileSync("src/_data/image-licences.json", "utf8")) : {};
const r = checkPost(file, { licences: lic, dir });
const rules = [...new Set(r.hits.map((h) => h.rule))];
const escalate = (why, verdict) => {
  const line = { ts: new Date().toISOString(), site: SITE, bot: BOT, title: r.title, flagged: r.hits.map((h) => `[rule ${h.rule}] ${h.flagged}`), rule: rules, sources: r.sources, suggestion: `Escalated: ${why}. Fix attempted: ${fix}`, chatgpt_verdict: verdict, draft_path: path.resolve(file), sha256: r.sha256, severity: rules.some((x) => severity(x) === "HIGH") ? "HIGH" : "MODERATE", status: "HOLD_REVIEW" };
  fs.appendFileSync(path.join(dir, "queue.jsonl"), JSON.stringify(line) + "\n");
  console.log(`ESCALATED to Joshua: ${why}`); process.exit(1);
};
if (!r.hits.length) { console.log("PASS: no hits remain, no clearance needed"); process.exit(0); }
if (rules.some((x) => severity(x) === "HIGH")) escalate(`HIGH severity rule(s) ${rules.filter((x) => severity(x) === "HIGH")}`, "not reviewed (HIGH)");
let out = "", ok = false;
try { out = execFileSync("python3", [process.env.CHATGPT_REVIEW || "/workspace/content-review/bin/chatgpt_review.py", file, `Rules ${rules.join(",")}: ${r.hits.map((h) => h.flagged).join("; ")}. Fix: ${fix}`], { encoding: "utf8" }); ok = true; }
catch (e) { out = String(e.stdout || e.message); }
let v = {}; try { v = JSON.parse(out.trim().split("\n").pop()); } catch { v = { verdict: "UNSURE", reasons: [out.slice(0, 300)] }; }
const summary = `${v.verdict || "UNSURE"}: ${(v.reasons || []).join(" | ").slice(0, 500)}`;
if (!ok || v.verdict !== "SAFE") escalate("ChatGPT did not agree it is safe", summary);
fs.appendFileSync(path.join(dir, CLEARANCES), JSON.stringify({ ts: new Date().toISOString(), site: SITE, bot: BOT, title: r.title, rule: rules, fix, chatgpt_verdict: summary, sha256: r.sha256, draft_path: path.resolve(file) }) + "\n");
console.log(`CLEARED_MODERATE ${file} ${r.sha256}`);
