# Grid and Pit

US focused Formula 1 news site at https://gridandpit.com. Built with Eleventy and deployed to GitHub Pages by `.github/workflows/pages.yml`.

Posts live in `src/content/posts`. Run `npm test` then `npm run build`.

Grid and Pit is independent and not affiliated with Formula 1 or the FIA.

## Legal hold gate (JI Ventures rule, 27 Oct 2026)
`lib/legal-hold.js` checks every post against the 8 hold rules in /workspace/content-review/RULE.md. `npm run build` runs the gate before Eleventy and verifies after; held posts get no page, are left out of the sitemap, feeds and IndexNow, and get one line in /workspace/content-review/queue.jsonl. `npm run deploy` (scripts/deploy.sh) is the only publish route, and a retry reruns the whole gate. A held post goes out only when /workspace/content-review/approvals.jsonl has Joshua's approval of its exact sha256. The gate never writes approvals. Image provenance lives in src/_data/image-licences.json.
