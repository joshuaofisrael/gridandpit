import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hubsForTags,
  insertAfterParagraph,
  isLookupDesk,
  isNewsDesk,
  pickBackground,
  pickFollowUps,
  pickRelated,
} from "../lib/engagement.js";

function post(url, category, tags, date) {
  return {
    url,
    date,
    data: { category, tags, date, title: url, hero: { src: "sample" } },
  };
}

const posts = [
  post("/a/", "News", ["vegas", "antonelli"], "2026-11-18"),
  post("/b/", "News", ["vegas"], "2026-11-19"),
  post("/c/", "Rules Explainers", ["rules", "antonelli"], "2026-11-03"),
  post("/d/", "Results", ["mexico", "antonelli"], "2026-11-02"),
  post("/e/", "Race Times", ["mexico"], "2026-10-27"),
  post("/f/", "Teams", ["cadillac"], "2026-11-01"),
];

test("related picks share a desk or a tag and skip the current url", () => {
  const related = pickRelated(posts, {
    category: "News",
    url: "/a/",
    tags: ["vegas", "antonelli"],
    limit: 4,
  });
  assert.deepEqual(related.map((item) => item.url), ["/b/", "/c/", "/d/"]);
  assert.ok(!related.some((item) => item.url === "/f/"));
});

test("follow ups are later stories that share a tag", () => {
  const follow = pickFollowUps(posts, {
    url: "/d/",
    tags: ["mexico", "antonelli"],
    publishedAt: new Date("2026-11-02").getTime(),
    limit: 3,
  });
  assert.deepEqual(follow.map((item) => item.url), ["/a/", "/c/"]);
});

test("follow ups fall back to one match when the exclude list would hide them all", () => {
  const follow = pickFollowUps(posts, {
    url: "/d/",
    tags: ["mexico", "antonelli"],
    publishedAt: new Date("2026-11-02").getTime(),
    exclude: [
      post("/a/", "News", ["antonelli"], "2026-11-18"),
      post("/c/", "Rules Explainers", ["antonelli"], "2026-11-03"),
    ],
    limit: 3,
  });
  assert.deepEqual(follow.map((item) => item.url), ["/a/"]);
});

test("background stays on evergreen desks and skips the current desk", () => {
  const background = pickBackground(posts, {
    url: "/a/",
    tags: ["antonelli", "mexico"],
    category: "News",
    limit: 3,
  });
  assert.deepEqual(background.map((item) => item.url), ["/c/", "/e/"]);
});

test("hubs match only the story tags", () => {
  const hubs = hubsForTags(
    [
      { slug: "las-vegas", tag: "vegas", title: "Las Vegas" },
      { slug: "miami", tag: "miami", title: "Miami" },
    ],
    ["vegas"],
  );
  assert.deepEqual(hubs.map((hub) => hub.slug), ["las-vegas"]);
});

test("a sitewide formula-1 tag does not count as a shared subject", () => {
  const extra = [
    post("/g/", "News", ["formula-1", "whoop"], "2026-11-19"),
    post("/h/", "News", ["formula-1", "whoop"], "2026-11-18"),
    post("/i/", "News", ["formula-1", "karting"], "2026-11-20"),
    post("/j/", "Rules Explainers", ["whoop"], "2026-11-01"),
  ];
  const related = pickRelated([...posts, ...extra], {
    category: "News",
    url: "/g/",
    tags: ["formula-1", "whoop"],
    limit: 4,
  });
  assert.deepEqual(
    related.map((item) => item.url),
    ["/h/", "/j/"],
  );
});

test("desk flags", () => {
  assert.equal(isNewsDesk("Results"), true);
  assert.equal(isNewsDesk("Rules Explainers"), false);
  assert.equal(isLookupDesk("Race Times"), true);
  assert.equal(isLookupDesk("News"), false);
});

test("mid article insert lands after paragraph 2, or 4 on a long piece", () => {
  const short = "<p>One</p><p>Two</p><p>Three</p><p>Four</p>";
  const placed = insertAfterParagraph(short, "<aside>next</aside>");
  assert.match(placed, /Two<\/p><aside>next<\/aside>/);
  assert.equal(insertAfterParagraph("<p>One</p><p>Two</p>", "<aside>next</aside>"), "<p>One</p><p>Two</p>");

  const long = Array.from({ length: 8 }, (_, index) => `<p>${index + 1}</p>`).join("");
  const later = insertAfterParagraph(long, "<aside>next</aside>");
  assert.match(later, /<p>4<\/p><aside>next<\/aside><p>5<\/p>/);
});
