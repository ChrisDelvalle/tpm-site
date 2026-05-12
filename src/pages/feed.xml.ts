import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getImage } from "astro:assets";

import { getAuthorEntries } from "../lib/authors";
import {
  getAnnouncements,
  getArticles,
  getSiteSocialFallbackImage,
} from "../lib/content";
import { publishableFeedEntries } from "../lib/feed";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../lib/routes";
import { absoluteUrl } from "../lib/seo";
import { siteConfig } from "../lib/site-config";
import { socialPreviewImageViewModel } from "../lib/social-images";

type FeedContext = Pick<APIContext, "site">;

/**
 * Generates the RSS feed endpoint from published article and announcement content.
 *
 * @param context Astro API route context with site metadata.
 * @returns RSS response for feed readers.
 */
export async function GET(context: FeedContext): Promise<Response> {
  const authors = await getAuthorEntries();
  const entries = siteConfig.features.feed
    ? publishableFeedEntries({
        announcements: await getAnnouncements(),
        articles: await getArticles(),
        authors,
      })
    : [];
  const fallbackSocialPreviewImage = await getSiteSocialFallbackImage();
  const site = context.site?.toString() ?? SITE_URL;

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: await Promise.all(
      entries.map(async (entry) => {
        const image = await socialPreviewImageViewModel({
          alt: entry.imageAlt,
          fallback: fallbackSocialPreviewImage,
          optimize: getImage,
          source: entry.image,
        });
        const absoluteImage = absoluteUrl(image.src, site);

        return {
          title: entry.title,
          pubDate: entry.pubDate,
          description: entry.description,
          link: entry.href,
          author: entry.author,
          customData: `<enclosure url="${absoluteImage}" type="${image.type}" />`,
        };
      }),
    ),
    customData: "<language>en-us</language>",
  });
}
