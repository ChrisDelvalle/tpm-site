import { describe, expect, test } from "vitest";

import HomeFeaturedSlide from "../../../../src/components/blocks/HomeFeaturedSlide.astro";
import type { HomeFeaturedItem } from "../../../../src/lib/home";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("HomeFeaturedSlide", () => {
  test("renders inherited article feature metadata and collection note", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeFeaturedSlide, {
      props: {
        index: 0,
        item: featuredItem({
          category: { href: "/categories/culture/", title: "Culture" },
          date: "May 5, 2026",
          description: "Inherited article description.",
          href: "/articles/what-is-a-meme/",
          kind: "article",
          note: "Optional editorial copy.",
          title: "What Is a Meme?",
        }),
      },
      request: new Request(`${testSiteUrl}/`),
    });

    expect(view).toContain("What Is a Meme?");
    expect(view).toContain("Culture");
    expect(view).toContain("Inherited article description.");
    expect(view).toContain("Optional editorial copy.");
    expect(view).toContain('data-home-featured-active="true"');
  });

  test("renders announcement features without article category metadata", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeFeaturedSlide, {
      props: {
        index: 1,
        item: featuredItem({
          href: "/announcements/join-discord/",
          kind: "announcement",
          title: "Join the TPM Discord",
        }),
      },
      request: new Request(`${testSiteUrl}/`),
    });

    expect(view).toContain("Join the TPM Discord");
    expect(view).toContain("/announcements/join-discord/");
    expect(view).toContain("hidden");
    expect(view).not.toContain("Culture");
  });
});

function featuredItem(
  overrides: Partial<HomeFeaturedItem> = {},
): HomeFeaturedItem {
  return {
    href: "/articles/feature/",
    id: "feature",
    kind: "article",
    slug: "feature",
    title: "Feature",
    ...overrides,
  };
}
