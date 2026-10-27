// JI Ventures pre-publish legal hold gate (RULE.md, 27 Oct 2026).
// Any post that trips a rule is HOLD_REVIEW: excluded from the build, logged to the
// shared review queue, and only publishable when approvals.jsonl holds Joshua's
// approval of that exact version (sha256). This module never writes approvals.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";

export const REVIEW_DIR = process.env.CONTENT_REVIEW_DIR || "/workspace/content-review";
export const SITE = "gridandpit.com";
export const BOT = "Grid and Pit site bot";

const RX = (s) => new RegExp(s, "i");
export const PATTERNS = {
  1: RX("\\b(fraud\\w*|corrupt\\w*|brib\\w*|embezzl\\w*|arrest\\w*|indict\\w*|convicted|charged with|assault\\w*|abus\\w*|harass\\w*|misconduct|cheat\\w*|lied|liar|dishonest\\w*|scandal\\w*|lawsuit|sued|criminal|illegal\\w*|cover ?up|rigged|match fixing|allegedly|accused|wrongdoing|racis\\w*)\\b"),
  2: RX("([\\w.+]+@(?!gridandpit\\.com)[\\w-]+\\.[\\w.]+)|(\\(?\\b\\d{3}\\)?[ .]\\d{3}[ .]\\d{4}\\b)|(\\+\\d{1,3}[ ()\\d]{8,}\\d)|\\b(home address|lives at|bank account|salary of|diagnos\\w*|hospitali[sz]ed|mental health|medical condition|pregnan\\w*|sexual\\w*|private messages?|leaked|doxx\\w*|victim)\\b"),
  5: RX("\\b(you should (buy|bet|invest|sell)|guaranteed (return|profit|win)|betting tips?|best bets?|parlay|wager\\w*|sportsbook\\w*|place a bet|investment advice|tax advice|legal advice|medical advice)\\b"),
  6: RX("\\b(election\\w*|ballots?|voters?|voting|polling (place|station|location)s?|register to vote|registration deadline|certified results?)\\b"),
  7: RX("\\b(official partner|officially endorsed|endorsed by|in partnership with formula 1|exclusive (interview|report|story|news)|^exclusive:|breaking news|leaked)\\b"),
  8: RX("\\b(embargo\\w*|cease and desist|takedown|dmca|legal notice|injunction|reporting restriction|correction request)\\b"),
};
// AMENDMENT 27 Oct 2026 18:25: severity tiers. HIGH is Joshua only, never self cleared.
// Rule 0 (front matter HOLD_REVIEW) is treated as HIGH so a manual hold is never auto released.
export const HIGH_RULES = new Set([0, 1, 2, 6, 8]);
export const severity = (rule) => (HIGH_RULES.has(Number(rule)) ? "HIGH" : "MODERATE");
export const CLEARANCES = "moderate-clearances.jsonl";
export function loadClearances(dir = REVIEW_DIR) {
  return readJsonl(path.join(dir, CLEARANCES)).filter(
    (c) => (c.site === SITE || c.site === "gridandpit") && c.sha256 && String(c.chatgpt_verdict || "").toUpperCase().startsWith("SAFE") && c.fix,
  );
}
const HEADLINE_STRONG = RX("\\b(confirmed|official(ly)?|proves?|guaranteed|exclusive|breaking|banned|sacked|fired)\\b");
const LEGAL_FLAGS = ["legalNotice", "embargo", "embargoUntil", "complaint", "correctionRequest", "rightsComplaint"];

export function versionHash(raw) {
  // Hash of the exact content, ignoring only the gate's own status/draft lines.
  const norm = raw.replace(/^(status|draft):.*\n/gm, "");
  return crypto.createHash("sha256").update(norm).digest("hex");
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

export function loadApprovals(dir = REVIEW_DIR) {
  return readJsonl(path.join(dir, "approvals.jsonl")).filter(
    (a) => (a.site === SITE || a.site === "gridandpit") && a.sha256 && /joshua/i.test(String(a.approved_by || a.approver || "")) && String(a.decision || a.status || "approved").toLowerCase().startsWith("approv"),
  );
}

function snippet(text, m) {
  const i = Math.max(0, m.index - 60);
  return text.slice(i, m.index + m[0].length + 60).replace(/\s+/g, " ").trim();
}

export function checkPost(file, { licences, dir = REVIEW_DIR } = {}) {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const hits = [];
  const add = (rule, flagged, suggestion) => hits.push({ rule, flagged, suggestion });
  const images = [data.hero, ...(data.images || [])].filter(Boolean);
  const textParts = [data.title, data.summary, data.description, ...images.flatMap((i) => [i.alt, i.caption]), content].filter(Boolean).map(String);
  const text = textParts.join("\n").replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, "");

  for (const [rule, rx] of Object.entries(PATTERNS)) {
    const g = new RegExp(rx.source, "gi"); let m; const seen = new Set();
    while ((m = g.exec(text)) && seen.size < 3) {
      if (seen.has(m[0].toLowerCase())) continue; seen.add(m[0].toLowerCase());
      add(Number(rule), snippet(text, m), {
        1: "Joshua to review the allegation and its sourcing; do not soften wording to pass.",
        2: "Remove the personal or sensitive detail, or get Joshua's approval.",
        5: "Rewrite as sourced reporting, not personal advice, then recheck.",
        6: "Confirm against the relevant election authority before publishing.",
        7: "Check the claim of affiliation or exclusivity matches the evidence.",
        8: "Flag to the Personal assistant with priority; do not republish.",
      }[rule]);
    }
  }
  if (HEADLINE_STRONG.test(String(data.title || ""))) add(7, `Headline: ${data.title}`, "Confirm the headline is no stronger than the sources; reword only if the evidence is weaker.");

  // Rule 3: every image needs a documented licence record matching the file bytes.
  for (const img of images) {
    const rec = licences?.[img.src];
    if (!rec) { add(3, `image ${img.src}`, "Add a licence record in src/_data/image-licences.json or drop the image."); continue; }
    if (!["Original", "Licensed"].includes(rec.licence)) add(3, `image ${img.src} licence ${rec.licence}`, "Fair use or unclear licence is not accepted; replace the image.");
    if (rec.licence === "Licensed" && !rec.permission_url) add(3, `image ${img.src}`, "Licensed images need a permission record URL.");
    for (const [name, sha] of Object.entries(rec.files || {})) {
      const p = path.join("src/assets/images", name);
      if (fs.existsSync(p) && crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") !== sha) add(3, `image file ${name} changed since its licence record`, "Re-record provenance for the new file.");
    }
    if (!/\b(illustration|chart|diagram|graphic)\b/i.test(`${img.alt} ${img.caption}`)) add(7, `image ${img.src} alt: ${img.alt}`, "Label synthetic or illustrative images clearly.");
  }
  if (/!\[[^\]]*\]\(|<img|<iframe|<video|<embed/i.test(content)) add(3, "inline image, video or embed in body", "Inline media needs a licence record; remove or register it.");
  const longQuotes = content.match(/>\s.{200,}/g);
  if (longQuotes) add(3, longQuotes[0].slice(0, 120), "Long quoted passages need permission; shorten or remove.");

  // Rule 4: claims need sources actually accessed.
  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (!sources.length) add(4, "no sources listed", "Add the sources actually accessed, or keep unpublished.");
  for (const s of sources) if (!/^https:\/\/\S+$/.test(String(s?.url || ""))) add(4, `source without https URL: ${s?.title || "?"}`, "Every source needs its URL.");
  for (const m of content.matchAll(/\b(TODO|TK|citation needed|\[source\]|unverified|rumou?r has it)\b/gi)) add(4, snippet(content, m), "Resolve the unsupported claim before publishing.");

  // Rule 8: legal flags in front matter or an open rule 8 queue entry.
  for (const k of LEGAL_FLAGS) if (data[k]) add(8, `${k}: ${JSON.stringify(data[k])}`, "Legal or restriction flag set; Personal assistant to be notified with priority.");
  const rel = path.relative(process.cwd(), file);
  const open8 = readJsonl(path.join(dir, "queue.jsonl")).find((q) => q.site === SITE && q.draft_path?.endsWith(rel) && String(q.rule).includes("8") && q.status === "HOLD_REVIEW");
  if (open8) add(8, "open rule 8 item in review queue", "Wait for Joshua.");
  if (String(data.status || "") === "HOLD_REVIEW") add(0, "status HOLD_REVIEW in front matter", "Awaiting Joshua's approval of this exact version.");

  return { file: rel, title: data.title, sources: sources.map((s) => s?.url).filter(Boolean), sha256: versionHash(raw), hits };
}

export function runGate(postsDir, { dir = REVIEW_DIR, writeQueue = true, licencesFile = "src/_data/image-licences.json" } = {}) {
  const licences = fs.existsSync(licencesFile) ? JSON.parse(fs.readFileSync(licencesFile, "utf8")) : {};
  const approvals = loadApprovals(dir);
  const clearances = loadClearances(dir);
  const queueFile = path.join(dir, "queue.jsonl");
  const queued = readJsonl(queueFile);
  const results = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md")).sort().map((f) => checkPost(path.join(postsDir, f), { licences, dir }));
  for (const r of results) {
    for (const h of r.hits) h.severity = severity(h.rule);
    r.severity = r.hits.length === 0 ? "NONE" : r.hits.some((h) => h.severity === "HIGH") ? "HIGH" : "MODERATE";
    r.approved = r.hits.length > 0 && approvals.some((a) => a.sha256 === r.sha256);
    // MODERATE only: publishable when this exact version has a fix plus a ChatGPT SAFE clearance.
    r.cleared = r.severity === "MODERATE" && clearances.some((c) => c.sha256 === r.sha256);
    r.status = r.hits.length === 0 ? "PASS" : r.approved ? "APPROVED" : r.cleared ? "CLEARED_MODERATE" : "HOLD_REVIEW";
    if (r.status === "HOLD_REVIEW" && writeQueue && !queued.some((q) => q.site === SITE && q.sha256 === r.sha256)) {
      const line = { ts: new Date().toISOString(), site: SITE, bot: BOT, title: r.title, flagged: r.hits.map((h) => `[rule ${h.rule}] ${h.flagged}`), rule: [...new Set(r.hits.map((h) => h.rule))].filter(Boolean), sources: r.sources, suggestion: [...new Set(r.hits.map((h) => h.suggestion))].join(" "), draft_path: path.resolve(r.file), sha256: r.sha256, severity: r.severity, status: "HOLD_REVIEW" };
      fs.mkdirSync(dir, { recursive: true }); fs.appendFileSync(queueFile, JSON.stringify(line) + "\n");
    }
  }
  return results;
}

export function heldSlugs(results) {
  return results.filter((r) => r.status === "HOLD_REVIEW").map((r) => path.basename(r.file, ".md"));
}
