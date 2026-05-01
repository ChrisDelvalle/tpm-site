import type { ImageMetadata } from "astro";
import { z } from "astro/zod";

/** Local image schema factory supplied by Astro content collections. */
interface ImageSchemaContext {
  image: () => z.ZodType<ImageMetadata>;
}

/**
 * Creates the article frontmatter schema.
 *
 * @param context Astro image schema context.
 * @param context.image Astro local-image schema helper.
 * @returns Strict article frontmatter schema.
 */
export function articleSchema(
  context: ImageSchemaContext,
): ReturnType<typeof createArticleSchema> {
  return createArticleSchema(context);
}

/**
 * Creates the category metadata schema.
 *
 * @returns Strict category metadata schema.
 */
export function categorySchema(): ReturnType<typeof createCategorySchema> {
  return createCategorySchema();
}

/**
 * Converts a content entry path into the generated article ID.
 *
 * @param entry Content loader entry path.
 * @returns File stem without Markdown or MDX extension.
 */
export function filenameStem(entry: string): string {
  return fileName(entry).replace(/\.(?:md|mdx)$/i, "");
}

/**
 * Creates the standalone page frontmatter schema.
 *
 * @returns Strict page frontmatter schema.
 */
export function pageSchema(): ReturnType<typeof createPageSchema> {
  return createPageSchema();
}

function createArticleSchema({ image }: ImageSchemaContext) {
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

function createCategorySchema() {
  return z
    .object({
      description: z.string().optional(),
      order: z.number().int().nonnegative(),
      title: z.string().min(1),
    })
    .strict();
}

function createPageSchema() {
  return z
    .object({
      description: z.string().optional(),
      draft: z.boolean().optional(),
      title: z.string(),
    })
    .strict();
}

function fileName(entry: string): string {
  const normalized = entry.replace(/\\/g, "/");
  const segments = normalized.split("/");

  return segments.at(-1) ?? normalized;
}
