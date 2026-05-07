import { readFileSync } from "node:fs";

import { z } from "astro/zod";

const SITE_CONFIG_PATH = "site/config/site.json";

const absoluteUrlSchema = z.string().url();
const sitePathSchema = z.string().min(1).refine(isSitePath, {
  message: "Expected a site path beginning with /.",
});
const pathOrUrlSchema = z.string().min(1).refine(isPathOrAbsoluteUrl, {
  message: "Expected a site path beginning with / or an absolute URL.",
});
const navigationLinkSchema = z
  .object({
    href: pathOrUrlSchema,
    label: z.string().min(1),
  })
  .strict();
const externalLinkSchema = z
  .object({
    ariaLabel: z.string().min(1).optional(),
    href: z.string().url(),
    label: z.string().min(1),
  })
  .strict();
const siteConfigSchema = z
  .object({
    identity: z
      .object({
        description: z.string().min(1),
        language: z.string().min(2),
        publisherName: z.string().min(1).optional(),
        shortTitle: z.string().min(1).optional(),
        timezone: z.string().min(1).optional(),
        title: z.string().min(1),
        url: z.string().url(),
      })
      .strict(),
    navigation: z
      .object({
        footer: z.array(navigationLinkSchema).default([]),
        primary: z.array(navigationLinkSchema).default([]),
      })
      .strict(),
    routes: z
      .object({
        allArticles: sitePathSchema,
        announcements: sitePathSchema,
        articles: sitePathSchema,
        authors: sitePathSchema,
        bibliography: sitePathSchema,
        categories: sitePathSchema,
        collections: sitePathSchema,
        feed: sitePathSchema,
        home: sitePathSchema,
        search: sitePathSchema,
        tags: sitePathSchema,
      })
      .strict(),
    share: z
      .object({
        threadsMention: z.string().min(1).optional(),
        xViaHandle: z.string().min(1).optional(),
      })
      .strict()
      .default({}),
    support: z
      .object({
        block: z
          .object({
            body: z.string().min(1),
            title: z.string().min(1),
          })
          .strict(),
        discord: externalLinkSchema,
        patreon: externalLinkSchema.extend({
          compactLabel: z.string().min(1).optional(),
        }),
      })
      .strict(),
  })
  .strict();

/** Site-owner editable configuration normalized for platform code. */
export type SiteConfig = z.infer<typeof siteConfigSchema>;

/** Named route keys exposed by the validated site config. */
export type SiteRouteKey = keyof SiteConfig["routes"];

/** Current site-instance configuration consumed by the Astro platform. */
export const siteConfig = parseSiteConfig(readSiteConfigJson());

/**
 * Parses and validates a site-owner config object.
 *
 * @param value Unknown JSON-compatible input.
 * @returns Normalized site config.
 */
export function parseSiteConfig(value: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  throw new Error(
    `Invalid site config at ${SITE_CONFIG_PATH}:\n${formatIssues(
      result.error.issues,
    )}`,
  );
}

/**
 * Builds a standard document title with the configured site title suffix.
 *
 * @param title Page or article title.
 * @returns Title suffixed by the current site title.
 */
export function titleWithSite(title: string): string {
  return `${title} | ${siteConfig.identity.title}`;
}

function readSiteConfigJson(): unknown {
  return JSON.parse(readFileSync("site/config/site.json", "utf8"));
}

function formatIssues(issues: readonly z.ZodIssue[]): string {
  return issues.map(formatIssue).join("\n");
}

function formatIssue(issue: z.ZodIssue): string {
  const path = issue.path.length === 0 ? "<root>" : issue.path.join(".");

  return `- ${path}: ${issue.message}`;
}

function isPathOrAbsoluteUrl(value: string): boolean {
  return isSitePath(value) || absoluteUrlSchema.safeParse(value).success;
}

function isSitePath(value: string): boolean {
  return value.startsWith("/");
}
