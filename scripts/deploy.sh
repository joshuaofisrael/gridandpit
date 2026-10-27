#!/usr/bin/env bash
# The only publish route for gridandpit.com (gh-pages). Retries rerun this whole script,
# so every attempt passes the legal hold gate again. Held items never reach _site.
# Tiers (RULE.md amendment): HIGH holds for Joshua; MODERATE publishes only with a
# ChatGPT SAFE clearance in moderate-clearances.jsonl (scripts/clear-moderate.js).
set -euo pipefail
cd "$(dirname "$0")/.."
npm test
rm -rf _site && npm run build        # gate before build, verify after
node scripts/hold-gate.js --dry --verify _site
touch _site/.nojekyll
sha=$(git rev-parse --short HEAD)
cd _site && git init -q -b gh-pages && git add -A \
  && git -c user.name=joshuaofisrael -c user.email=joshuaofisrael@users.noreply.github.com commit -qm "Deploy $sha" \
  && git push -q -f https://github.com/joshuaofisrael/gridandpit.git gh-pages
rm -rf .git
