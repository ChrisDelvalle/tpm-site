import { describe, expect, test } from "bun:test";

import {
  parseSiteConfig,
  type SiteConfig,
  siteConfig,
  titleWithSite,
} from "../../../src/lib/site-config";

const validConfig = {
  identity: {
    description: "A configurable publication.",
    language: "en",
    title: "Example Blog",
    url: "https://example.com",
  },
  homepage: {
    announcementLimit: 2,
    featuredCollection: "featured",
    recentLimit: 6,
    startHereCollection: "start-here",
  },
  navigation: {
    footer: [{ href: "/feed.xml", label: "RSS" }],
    primary: [{ href: "/articles/", label: "Articles" }],
  },
  routes: {
    allArticles: "/articles/all/",
    announcements: "/announcements/",
    articles: "/articles/",
    authors: "/authors/",
    bibliography: "/bibliography/",
    categories: "/categories/",
    collections: "/collections/",
    feed: "/feed.xml",
    home: "/",
    search: "/search/",
    tags: "/tags/",
  },
  support: {
    block: {
      body: "Keep publishing going.",
      title: "Support Example Blog",
    },
    discord: {
      href: "https://discord.gg/example",
      label: "Join Discord",
    },
    patreon: {
      compactLabel: "Patreon",
      href: "https://patreon.com/example",
      label: "Support Us",
    },
  },
} as const;

describe("site config", () => {
  test("loads the current TPM site config from the site directory", () => {
    expect(siteConfig.identity.title).toBe("The Philosopher's Meme");
    expect(siteConfig.identity.url).toBe("https://thephilosophersmeme.com");
    expect(siteConfig.navigation.primary).toEqual([
      { href: "/articles/", label: "Articles" },
      { href: "/about/", label: "About" },
    ]);
    expect(siteConfig.support.patreon.href).toBe(
      "https://patreon.com/thephilosophersmeme",
    );
    expect(siteConfig.homepage).toEqual({
      announcementLimit: 3,
      featuredCollection: "featured",
      recentLimit: 8,
      startHereCollection: "start-here",
    });
    expect(siteConfig.features.pdf).toBe(true);
    expect(siteConfig.features.support).toBe(true);
    expect(siteConfig.contentDefaults.articles.pdf.enabled).toBe(true);
    expect(siteConfig.contentDefaults.announcements.visibility.search).toBe(
      true,
    );
    expect(siteConfig.share.xViaHandle).toBe("philo_meme");
  });

  test("parses a non-TPM blog config with default share, feature, and content settings", () => {
    const parsed: SiteConfig = parseSiteConfig(validConfig);

    expect(parsed.identity.title).toBe("Example Blog");
    expect(parsed.share).toEqual({});
    expect(parsed.features.search).toBe(true);
    expect(parsed.contentDefaults.articles).toEqual({
      draft: false,
      pdf: { enabled: true },
      visibility: {
        directory: true,
        feed: true,
        homepage: true,
        search: true,
      },
    });
    expect(parsed.navigation.footer).toEqual([
      { href: "/feed.xml", label: "RSS" },
    ]);
  });

  test("parses webmaster-owned feature and content defaults", () => {
    const parsed = parseSiteConfig({
      ...validConfig,
      contentDefaults: {
        announcements: {
          visibility: {
            search: false,
          },
        },
        articles: {
          pdf: {
            enabled: false,
          },
          visibility: {
            feed: false,
          },
        },
      },
      features: {
        pdf: false,
        support: false,
      },
    });

    expect(parsed.features).toMatchObject({
      pdf: false,
      search: true,
      support: false,
    });
    expect(parsed.contentDefaults.announcements).toEqual({
      draft: false,
      visibility: {
        directory: true,
        feed: true,
        homepage: true,
        search: false,
      },
    });
    expect(parsed.contentDefaults.articles).toEqual({
      draft: false,
      pdf: { enabled: false },
      visibility: {
        directory: true,
        feed: false,
        homepage: true,
        search: true,
      },
    });
  });

  test("rejects malformed links with path-aware errors", () => {
    const invalidConfig = {
      ...validConfig,
      navigation: {
        ...validConfig.navigation,
        primary: [{ href: "articles", label: "Articles" }],
      },
    };

    expect(() => parseSiteConfig(invalidConfig)).toThrow(
      /navigation\.primary\.0\.href/u,
    );
  });

  test("rejects non-path route values", () => {
    const invalidConfig = {
      ...validConfig,
      routes: {
        ...validConfig.routes,
        articles: "articles",
      },
    };

    expect(() => parseSiteConfig(invalidConfig)).toThrow(/routes\.articles/u);
  });

  test("builds titles with the configured site suffix", () => {
    expect(titleWithSite("Articles")).toBe("Articles | The Philosopher's Meme");
  });
});
