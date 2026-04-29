import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

function articleSlugFromEntry(entry: string, data: Record<string, unknown>) {
  const permalink =
    typeof data["legacyPermalink"] === "string"
      ? data["legacyPermalink"]
      : typeof data["permalink"] === "string"
        ? data["permalink"]
        : "";
  const permalinkMatch = /^\/?\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/.exec(permalink);
  const fallback = entry
    .replace(/\.(?:md|mdx|markdown)$/i, "")
    .replace(/(^|\/)\d{4}[-_]\d{2}[-_]\d{2}[-_]/, "$1");

  if (permalinkMatch?.[1] !== undefined && permalinkMatch[1] !== "") {
    return permalinkMatch[1];
  }

  return fallback;
}

const legacyMarkdown = defineCollection({
  loader: glob({
    base: "./src/content/legacy",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry, data }) => articleSlugFromEntry(entry, data),
  }),
  schema: z
    .object({
      title: z.unknown().optional(),
      date: z.unknown().optional(),
      author: z.unknown().optional(),
      parent: z.unknown().optional(),
      grand_parent: z.unknown().optional(),
      nav_order: z.unknown().optional(),
      permalink: z.unknown().optional(),
      legacyPermalink: z.unknown().optional(),
      excerpt: z.unknown().optional(),
      description: z.unknown().optional(),
      image: z.unknown().optional(),
      imageAlt: z.unknown().optional(),
      legacyBanner: z.unknown().optional(),
      tags: z.unknown().optional(),
      categories: z.unknown().optional(),
      published: z.unknown().optional(),
      draft: z.unknown().optional(),
      status: z.unknown().optional(),
      type: z.unknown().optional(),
      banner: z.unknown().optional(),
      fbpreview: z.unknown().optional(),
      facebook: z.unknown().optional(),
      meta: z.unknown().optional(),
      has_children: z.unknown().optional(),
      layout: z.unknown().optional(),
    })
    .loose(),
});

const pages = defineCollection({
  loader: glob({
    base: "./src/content/pages",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  legacyMarkdown,
  pages,
};
