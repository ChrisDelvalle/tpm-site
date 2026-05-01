import { basename } from "node:path";

import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

function articleSchema({ image }: { image: () => z.ZodType }) {
  return z
    .object({
      author: z.string().min(1),
      date: z.coerce.date(),
      description: z.string().min(1),
      draft: z.boolean().default(false),
      image: image().optional(),
      imageAlt: z.string().optional(),
      legacyBanner: z.string().optional(),
      legacyPermalink: z.string().optional(),
      tags: z.array(z.string()).default([]),
      title: z.string().min(1),
    })
    .strict();
}

function filenameStem(entry: string) {
  return basename(entry).replace(/\.(?:md|mdx)$/i, "");
}

const articles = defineCollection({
  loader: glob({
    base: "./src/content/articles",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => filenameStem(entry),
  }),
  schema: articleSchema,
});

const categories = defineCollection({
  loader: glob({
    base: "./src/content/categories",
    pattern: "*.json",
  }),
  schema: z
    .object({
      description: z.string().optional(),
      order: z.number().int().nonnegative(),
      title: z.string().min(1),
    })
    .strict(),
});

const pages = defineCollection({
  loader: glob({
    base: "./src/content/pages",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z
    .object({
      description: z.string().optional(),
      draft: z.boolean().optional(),
      title: z.string(),
    })
    .strict(),
});

export const collections = {
  articles,
  categories,
  pages,
};
