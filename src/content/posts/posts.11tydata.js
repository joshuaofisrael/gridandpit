import site from "../../_data/site.js";
import { isDraft } from "../../../lib/validate-posts.js";
import { runGate, heldSlugs } from "../../../lib/legal-hold.js";
import { isAwaitingPublish } from "../../../lib/dates.js";

// Legal hold gate: held posts never get a permalink or enter collections (feeds, sitemap, IndexNow).
const HELD = new Set(heldSlugs(runGate("src/content/posts", { writeQueue: process.env.HOLD_GATE_DRY !== "1" })));
const slug = (data) => String(data.page.inputPath).split("/").pop().replace(/\.md$/, "");

const includeDrafts = process.env.ELEVENTY_ENV === "development";

function heldBack(data) {
  if (HELD.has(slug(data))) return true;
  if (isDraft(data.draft) && !includeDrafts) return true;
  // Scheduled stories stay out of the production build until publishAt.
  if (!includeDrafts && isAwaitingPublish(data.publishAt)) return true;
  return false;
}

export default {
  layout: "layouts/article.njk",
  kind: "article",
  eleventyComputed: {
    author() {
      return site.author;
    },
    permalink(data) {
      if (heldBack(data)) return false;
      const file = String(data.page.inputPath).split("/").pop().replace(/\.md$/, "");
      return `/articles/${file}/`;
    },
    eleventyExcludeFromCollections(data) {
      return heldBack(data);
    },
  },
};
