import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import {
  articleSchema,
  categorySchema,
  filenameStem,
  pageSchema,
} from "./lib/content-schemas";

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
  schema: categorySchema(),
});

const pages = defineCollection({
  loader: glob({
    base: "./src/content/pages",
    pattern: "**/*.{md,mdx}",
  }),
  schema: pageSchema(),
});

export const collections = {
  articles,
  categories,
  pages,
};
