import type { ImageMetadata } from "astro";
import { z } from "astro/zod";

import { tagDiagnostics } from "./tags";

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
 * Creates the author metadata schema.
 *
 * @returns Strict author metadata schema.
 */
export function authorSchema(): ReturnType<typeof createAuthorSchema> {
  return createAuthorSchema();
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
      tags: tagListSchema(),
      title: z.string().min(1),
    })
    .strict();
}

function tagListSchema() {
  return z
    .array(z.string())
    .default([])
    .superRefine((tags, context) => {
      tagDiagnostics(tags).forEach((diagnostic) => {
        context.addIssue({
          code: "custom",
          message: diagnostic.message,
          path: [diagnostic.index],
        });
      });
    });
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

function createAuthorSchema() {
  const socialLinkSchema = z
    .object({
      href: z.string().url(),
      label: z.string().min(1),
    })
    .strict();

  return z
    .object({
      aliases: z.array(z.string().min(1)).default([]),
      displayName: z.string().min(1),
      shortBio: z.string().optional(),
      socials: z.array(socialLinkSchema).default([]),
      type: z.enum(["anonymous", "collective", "organization", "person"]),
      website: z.string().url().optional(),
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
