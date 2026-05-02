import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import {
  articleSchema,
  authorSchema,
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

const authors = defineCollection({
  loader: glob({
    base: "./src/content/authors",
    generateId: ({ entry }) => filenameStem(entry),
    pattern: "*.md",
  }),
  schema: authorSchema(),
});

const pages = defineCollection({
  loader: glob({
    base: "./src/content/pages",
    generateId: ({ entry }) => filenameStem(entry),
    pattern: "**/*.{md,mdx}",
  }),
  schema: pageSchema(),
});

const articleReferenceArticleFixtures = defineCollection({
  loader: glob({
    base: "./tests/fixtures/article-reference-articles",
    generateId: ({ entry }) => filenameStem(entry),
    pattern: "**/*.{md,mdx}",
  }),
  schema: articleSchema,
});

const articleReferenceProofFixtures = defineCollection({
  loader: glob({
    base: "./tests/fixtures/article-references",
    generateId: ({ entry }) => filenameStem(entry),
    pattern: "**/*.{md,mdx}",
  }),
  schema: pageSchema(),
});

export const collections = {
  articleReferenceArticleFixtures,
  articleReferenceProofFixtures,
  articles,
  authors,
  categories,
  pages,
};
