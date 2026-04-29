import { getCollection } from "astro:content";

import {
  assertUniqueArticleSlugs,
  isPublishedArticle,
  type LegacyEntry,
  sortNewestFirst,
  sourceFolder,
  TOPICS,
} from "./routes";

async function getLegacyEntries() {
  return getCollection("legacyMarkdown");
}

export async function getArticles() {
  const entries = await getLegacyEntries();
  assertUniqueArticleSlugs(entries);
  return sortNewestFirst(entries.filter(isPublishedArticle));
}

export function articlesForTopic(entries: LegacyEntry[], topicSlug: string) {
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
