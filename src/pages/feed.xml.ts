import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getImage } from "astro:assets";

import fallbackSocialPreviewImage from "../assets/shared/tpm_home_hero_light.png";
import { authorDisplayNameForArticle, getAuthorEntries } from "../lib/authors";
import { getArticles } from "../lib/content";
import {
  articleUrl,
  entryDate,
  entryTitle,
  excerpt,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "../lib/routes";
import { absoluteUrl } from "../lib/seo";
import { socialPreviewImageViewModel } from "../lib/social-images";

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
  const site = context.site?.toString() ?? SITE_URL;

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: await Promise.all(
      articles.map(async (article) => {
        const image = await socialPreviewImageViewModel({
          alt: article.data.imageAlt ?? entryTitle(article),
          fallback: fallbackSocialPreviewImage,
          optimize: getImage,
          source: article.data.image,
        });
        const absoluteImage = absoluteUrl(image.src, site);

        return {
          title: entryTitle(article),
          pubDate: entryDate(article),
          description: excerpt(article),
          link: articleUrl(article.id),
          author: authorDisplayNameForArticle(article, authors),
          customData: `<enclosure url="${absoluteImage}" type="${image.type}" />`,
        };
      }),
    ),
    customData: "<language>en-us</language>",
  });
}
