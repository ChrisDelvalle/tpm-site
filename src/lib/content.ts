import { getCollection } from "astro:content";

import {
  type ArticleEntry,
  assertUniqueArticleSlugs,
  isPublishedArticle,
  sortNewestFirst,
  sourceFolder,
  TOPICS,
} from "./routes";

async function getArticleEntries() {
  return getCollection("articles");
}

export async function getArticles() {
  const entries = await getArticleEntries();
  assertUniqueArticleSlugs(entries);
  return sortNewestFirst(entries.filter(isPublishedArticle));
}

export function articlesForTopic(entries: ArticleEntry[], topicSlug: string) {
  const topic = TOPICS.find((item) => item.slug === topicSlug);
  if (!topic) {
    return [];
  }

  return sortNewestFirst(
    entries.filter((entry) => {
      const entryTopic = sourceFolder(entry);
      return isPublishedArticle(entry) && entryTopic === topic.source;
    }),
  );
}
