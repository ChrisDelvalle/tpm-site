import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

function articleSlugFromEntry(entry: string, data: Record<string, unknown>) {
  const permalink = typeof data.permalink === "string" ? data.permalink : "";
  const permalinkMatch = permalink.match(/^\/?\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/);

  if (permalinkMatch) {
    return permalinkMatch[1];
  }

  return entry
    .replace(/\.(md|markdown)$/i, "")
    .replace(/(^|\/)\d{4}[-_]\d{2}[-_]\d{2}[-_]/, "$1");
}

const legacyMarkdown = defineCollection({
  loader: glob({
    base: "./src/content/legacy",
    pattern: "**/*.md",
    generateId: ({ entry, data }) => articleSlugFromEntry(entry, data),
  }),
  schema: z
    .object({
      title: z.any().optional(),
      date: z.any().optional(),
      author: z.any().optional(),
      parent: z.any().optional(),
      grand_parent: z.any().optional(),
      nav_order: z.any().optional(),
      permalink: z.any().optional(),
      excerpt: z.any().optional(),
      description: z.any().optional(),
      image: z.any().optional(),
      tags: z.any().optional(),
      categories: z.any().optional(),
      published: z.any().optional(),
      status: z.any().optional(),
      type: z.any().optional(),
      banner: z.any().optional(),
      fbpreview: z.any().optional(),
      facebook: z.any().optional(),
      meta: z.any().optional(),
      has_children: z.any().optional(),
      layout: z.any().optional(),
    })
    .loose(),
});

export const collections = {
  legacyMarkdown,
};
