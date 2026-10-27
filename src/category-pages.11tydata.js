export default {
  eleventyComputed: {
    // /category/<slug>/ duplicates /topics/<slug>/, which the nav links to.
    // Point search engines at the topic page and keep this one out of the sitemap.
    canonicalPath(data) {
      return data.desk?.slug ? `/topics/${data.desk.slug}/` : undefined;
    },
    title(data) {
      return data.desk?.name || "Topic";
    },
    summary(data) {
      return data.desk?.description || "";
    },
  },
};
