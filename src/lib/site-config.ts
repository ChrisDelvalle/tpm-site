import { readFileSync } from "node:fs";

import { z } from "astro/zod";

import { projectRelativePath, siteInstance } from "./site-instance";

const SITE_CONFIG_PATH = projectRelativePath(siteInstance.config.site);

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
const defaultHomepageConfig = {
  announcementLimit: 3,
  featuredCollection: "featured",
  recentLimit: 8,
  startHereCollection: "start-here",
} as const;
const defaultFeatureConfig = {
  announcements: true,
  authors: true,
  bibliography: true,
  categories: true,
  collections: true,
  feed: true,
  pdf: true,
  search: true,
  support: true,
  tags: true,
  themeToggle: true,
} as const;
const defaultPublishableVisibilityConfig = {
  directory: true,
  feed: true,
  homepage: true,
  search: true,
} as const;
const defaultContentDefaultsConfig = {
  announcements: {
    draft: false,
    visibility: defaultPublishableVisibilityConfig,
  },
  articles: {
    draft: false,
    pdf: {
      enabled: true,
    },
    visibility: defaultPublishableVisibilityConfig,
  },
} as const;
const homepageConfigSchema = z
  .object({
    announcementLimit: z
      .number()
      .int()
      .positive()
      .default(defaultHomepageConfig.announcementLimit),
    featuredCollection: z
      .string()
      .min(1)
      .default(defaultHomepageConfig.featuredCollection),
    recentLimit: z
      .number()
      .int()
      .positive()
      .default(defaultHomepageConfig.recentLimit),
    startHereCollection: z
      .string()
      .min(1)
      .default(defaultHomepageConfig.startHereCollection),
  })
  .strict()
  .default(defaultHomepageConfig);
const featureConfigSchema = z
  .object({
    announcements: z.boolean().default(defaultFeatureConfig.announcements),
    authors: z.boolean().default(defaultFeatureConfig.authors),
    bibliography: z.boolean().default(defaultFeatureConfig.bibliography),
    categories: z.boolean().default(defaultFeatureConfig.categories),
    collections: z.boolean().default(defaultFeatureConfig.collections),
    feed: z.boolean().default(defaultFeatureConfig.feed),
    pdf: z.boolean().default(defaultFeatureConfig.pdf),
    search: z.boolean().default(defaultFeatureConfig.search),
    support: z.boolean().default(defaultFeatureConfig.support),
    tags: z.boolean().default(defaultFeatureConfig.tags),
    themeToggle: z.boolean().default(defaultFeatureConfig.themeToggle),
  })
  .strict()
  .default(defaultFeatureConfig);
const publishableVisibilityConfigSchema = z
  .object({
    directory: z
      .boolean()
      .default(defaultPublishableVisibilityConfig.directory),
    feed: z.boolean().default(defaultPublishableVisibilityConfig.feed),
    homepage: z.boolean().default(defaultPublishableVisibilityConfig.homepage),
    search: z.boolean().default(defaultPublishableVisibilityConfig.search),
  })
  .strict()
  .default(defaultPublishableVisibilityConfig);
const baseContentDefaultsConfigSchema = z.object({
  draft: z.boolean().default(false),
  visibility: publishableVisibilityConfigSchema,
});
const contentDefaultsConfigSchema = z
  .object({
    announcements: baseContentDefaultsConfigSchema
      .strict()
      .default(defaultContentDefaultsConfig.announcements),
    articles: baseContentDefaultsConfigSchema
      .extend({
        pdf: z
          .object({
            enabled: z
              .boolean()
              .default(defaultContentDefaultsConfig.articles.pdf.enabled),
          })
          .strict()
          .default(defaultContentDefaultsConfig.articles.pdf),
      })
      .strict()
      .default(defaultContentDefaultsConfig.articles),
  })
  .strict()
  .default(defaultContentDefaultsConfig);
const siteConfigSchema = z
  .object({
    contentDefaults: contentDefaultsConfigSchema,
    features: featureConfigSchema,
    homepage: homepageConfigSchema,
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
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- Build-time site config is resolved through the site-instance path adapter.
  return JSON.parse(readFileSync(siteInstance.config.site, "utf8"));
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
