import rss from "@astrojs/rss";
import type { APIContext } from "astro";

import { authorDisplayNameForArticle, getAuthorEntries } from "../lib/authors";
import { getArticles } from "../lib/content";
import {
  articleUrl,
  entryDate,
  entryTitle,
  excerpt,
  imageUrl,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "../lib/routes";
import { absoluteUrl } from "../lib/seo";

type FeedContext = Pick<APIContext, "site">;

/**
 * Generates the RSS feed endpoint from published article content.
 *
 * @param context Astro API route context with site metadata.
 * @returns RSS response for feed readers.
 */
export async function GET(context: FeedContext): Promise<Response> {
  const articles = await getArticles();
  const authors = await getAuthorEntries();
  const site = context.site?.toString() ?? "https://thephilosophersmeme.com";

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: articles.map((article) => {
      const image = imageUrl(article);
      const absoluteImage =
        image === undefined ? undefined : absoluteUrl(image, site);

      return {
        title: entryTitle(article),
        pubDate: entryDate(article),
        description: excerpt(article),
        link: articleUrl(article.id),
        author: authorDisplayNameForArticle(article, authors),
        customData:
          absoluteImage === undefined
            ? undefined
            : `<enclosure url="${absoluteImage}" type="image/jpeg" />`,
      };
    }),
    customData: "<language>en-us</language>",
  });
}
