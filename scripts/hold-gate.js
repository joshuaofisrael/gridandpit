#!/usr/bin/env node
// Usage: node scripts/hold-gate.js [--dry] [--verify _site]
// Exit 0 always for the check itself (held posts are excluded, the rest publish);
// --verify exits 1 if any held article exists in the built output.
import fs from "node:fs";
import { runGate, heldSlugs } from "../lib/legal-hold.js";
const args = process.argv.slice(2);
const results = runGate("src/content/posts", { writeQueue: !args.includes("--dry") });
fs.mkdirSync(".hold", { recursive: true });
fs.writeFileSync(".hold/status.json", JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
for (const r of results) console.log(`${r.status.padEnd(11)} ${r.file}${r.hits.length ? "  rules " + [...new Set(r.hits.map((h) => h.rule))].join(",") : ""}`);
const held = heldSlugs(results);
const vi = args.indexOf("--verify");
if (vi >= 0) {
  const out = args[vi + 1] || "_site";
  const leaked = held.filter((s) => fs.existsSync(`${out}/articles/${s}`) || fs.readFileSync(`${out}/sitemap.xml`, "utf8").includes(s));
  if (leaked.length) { console.error("HOLD GATE FAIL: held content in build:", leaked.join(", ")); process.exit(1); }
  console.log(`HOLD GATE OK: ${held.length} held, none in ${out}`);
}
