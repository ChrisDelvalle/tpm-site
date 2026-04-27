import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getArticles } from "../lib/content";
import {
  articleUrl,
  authorName,
  entryDate,
  entryTitle,
  excerpt,
  imageUrl,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "../lib/routes";

export async function GET(context: APIContext) {
  const articles = await getArticles();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site?.toString() || "https://thephilosophersmeme.com",
    items: articles.map((article) => ({
      title: entryTitle(article),
      pubDate: entryDate(article),
      description: excerpt(article),
      link: articleUrl(article.id),
      author: authorName(article),
      customData: imageUrl(article)
        ? `<enclosure url="${imageUrl(article)}" type="image/jpeg" />`
        : undefined,
    })),
    customData: "<language>en-us</language>",
  });
}
