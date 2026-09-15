export function normalizeGdeltArticles(data, context = {}) {
  const rawArticles = Array.isArray(data?.articles) ? data.articles : [];

  const articles = rawArticles.map((art) => ({
    title: art.title ?? art.Title ?? null,
    url: art.url ?? art.URL ?? null,
    domain: art.domain ?? art.Domain ?? null,
    source_country:
      art.sourcecountry ??
      art.sourceCountry ??
      art.source_country ??
      art.country ??
      null,
    language: art.language ?? art.Language ?? null,
    published_at:
      art.seendate ??
      art.seenDate ??
      art.published_at ??
      art.publishedAt ??
      art.date ??
      null,
    social_image:
      art.socialimage ??
      art.socialImage ??
      art.social_image ??
      art.image ??
      null
  }));

  return {
    query: context.query ?? null,
    timespan: context.timespan ?? null,

    article_count: articles.length,

    articles,

    provider: "gdelt",
    fetched_at: new Date().toISOString()
  };
}
