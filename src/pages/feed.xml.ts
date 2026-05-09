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
  const site = context.site?.toString() ?? "https://thephilosophersmeme.com";

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: articles.map((article) => {
      const image = imageUrl(article);
      const absoluteImage =
        image === undefined ? undefined : new URL(image, site).toString();

      return {
        title: entryTitle(article),
        pubDate: entryDate(article),
        description: excerpt(article),
        link: articleUrl(article.id),
        author: authorName(article),
        customData:
          absoluteImage === undefined
            ? undefined
            : `<enclosure url="${absoluteImage}" type="image/jpeg" />`,
      };
    }),
    customData: "<language>en-us</language>",
  });
}
