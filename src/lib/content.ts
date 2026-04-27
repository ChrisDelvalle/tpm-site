import { getCollection } from "astro:content";
import {
  assertUniqueArticleSlugs,
  isPublishedArticle,
  sourceFolder,
  sortNewestFirst,
  TOPICS,
  type LegacyEntry,
} from "./routes";

export async function getLegacyEntries() {
  return getCollection("legacyMarkdown");
}

export async function getArticles() {
  const entries = await getLegacyEntries();
  assertUniqueArticleSlugs(entries);
  return sortNewestFirst(entries.filter(isPublishedArticle));
}

export async function getArticleBySlug(slug: string) {
  const articles = await getArticles();
  return articles.find((entry) => entry.id === slug);
}

export async function getAboutPage() {
  const entries = await getLegacyEntries();
  return entries.find((entry) => entry.id === "notes/about");
}

export function articlesForTopic(entries: LegacyEntry[], topicSlug: string) {
  const topic = TOPICS.find((item) => item.slug === topicSlug);
  if (!topic) return [];

  return sortNewestFirst(
    entries.filter((entry) => {
      const entryTopic = sourceFolder(entry);
      return isPublishedArticle(entry) && entryTopic === topic.source;
    }),
  );
}
