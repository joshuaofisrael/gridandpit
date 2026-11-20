// Related next-reads, follow-ups and background links for article pages.
// Scoring stays in code so the template cannot drift into unrelated filler.

const NEWS_DESKS = new Set(["News", "Driver Market", "Teams", "Results", "Standings"]);
const LOOKUP_DESKS = new Set(["Rules Explainers", "Race Times"]);
const EVERGREEN_DESKS = LOOKUP_DESKS;
// Present on a large share of stories, so it does not mean two pieces are about the same thing.
const GENERIC_TAGS = new Set(["formula-1", "f1", "news", "post"]);

export function isNewsDesk(category) {
  return NEWS_DESKS.has(category);
}

export function isLookupDesk(category) {
  return LOOKUP_DESKS.has(category);
}

export function storyTags(post) {
  const tags = post?.data?.tags;
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag) => typeof tag === "string" && tag.trim() && tag !== "post");
}

export function publishTime(post) {
  const raw = post?.data?.publishAt || post?.data?.date || post?.date;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.getTime();
  const when = raw ? new Date(raw) : null;
  return when && !Number.isNaN(when.getTime()) ? when.getTime() : 0;
}

function asTagList(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag) => typeof tag === "string" && tag.trim() && !GENERIC_TAGS.has(tag));
}

function urlSet(posts) {
  return new Set((posts || []).map((post) => post?.url).filter(Boolean));
}

function eligible(posts, { url, exclude, isListed }) {
  const skip = urlSet(exclude);
  if (url) skip.add(url);
  return (posts || []).filter((post) => {
    if (!post?.url || skip.has(post.url)) return false;
    if (typeof isListed === "function" && !isListed(post)) return false;
    return true;
  });
}

function byScoreThenNewest(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  return publishTime(b.post) - publishTime(a.post);
}

export function pickRelated(posts, { category, url, tags = [], limit = 4, isListed } = {}) {
  const wanted = new Set(asTagList(tags));
  const cap = Math.max(1, Number(limit) || 4);
  const ranked = eligible(posts, { url, isListed })
    .map((post) => {
      let score = 0;
      if (category && post.data?.category === category) score += 2;
      for (const tag of storyTags(post)) if (wanted.has(tag)) score += 10;
      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort(byScoreThenNewest);
  const chosen = [];
  const seen = new Set();
  for (const item of ranked) {
    if (item.score < 10 || chosen.length >= cap) continue;
    chosen.push(item.post);
    seen.add(item.post.url);
  }
  if (chosen.length === 0) {
    const floor = Math.min(3, cap);
    for (const item of ranked) {
      if (chosen.length >= floor) break;
      if (item.post.data?.category !== category) continue;
      chosen.push(item.post);
    }
  }
  return chosen;
}

function selectFollowUps(posts, { url, tags, publishedAt, limit, exclude, isListed }) {
  const wanted = new Set(asTagList(tags));
  const after = Number(publishedAt) || 0;
  const cap = Math.max(1, Number(limit) || 3);
  return eligible(posts, { url, exclude, isListed })
    .filter((post) => publishTime(post) > after)
    .map((post) => ({
      post,
      score: storyTags(post).filter((tag) => wanted.has(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort(byScoreThenNewest)
    .slice(0, cap)
    .map((item) => item.post);
}

export function pickFollowUps(posts, options = {}) {
  const primary = selectFollowUps(posts, options);
  if (primary.length || !options.exclude?.length) return primary;
  return selectFollowUps(posts, { ...options, exclude: [], limit: 1 });
}

export function pickBackground(posts, { url, tags = [], category, limit = 3, exclude, isListed } = {}) {
  const wanted = new Set(asTagList(tags));
  const cap = Math.max(1, Number(limit) || 3);
  return eligible(posts, { url, exclude, isListed })
    .filter((post) => EVERGREEN_DESKS.has(post.data?.category) && post.data?.category !== category)
    .map((post) => ({
      post,
      score: storyTags(post).filter((tag) => wanted.has(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort(byScoreThenNewest)
    .slice(0, cap)
    .map((item) => item.post);
}

export function hubsForTags(hubs, tags) {
  const wanted = new Set(asTagList(tags));
  return (hubs || []).filter((hub) => hub?.tag && wanted.has(hub.tag));
}

export function insertAfterParagraph(html, block, { minParagraphs = 3 } = {}) {
  const source = String(html || "");
  const snippet = String(block || "").trim();
  if (!snippet) return source;
  const count = (source.match(/<\/p>/gi) || []).length;
  if (count < minParagraphs) return source;
  const target = count >= 8 ? 4 : 2;
  const chunks = source.split(/(<\/p>)/i);
  let paragraph = 0;
  let out = "";
  let placed = false;
  for (const chunk of chunks) {
    out += chunk;
    if (!/^<\/p>$/i.test(chunk)) continue;
    paragraph += 1;
    if (!placed && paragraph === target) {
      out += snippet;
      placed = true;
    }
  }
  return out;
}
