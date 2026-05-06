import { describe, expect, test } from "vitest";

import HomeFeaturedSlide from "../../../../src/components/blocks/HomeFeaturedSlide.astro";
import type { HomeFeaturedItem } from "../../../../src/lib/home";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("HomeFeaturedSlide", () => {
  test("renders inherited article feature metadata and editorial body copy", async () => {
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
          title: "What Is a Meme?",
        }),
      },
      request: new Request(`${testSiteUrl}/`),
      slots: {
        default: "Optional editorial copy.",
      },
    });

    expect(view).toContain("What Is a Meme?");
    expect(view).toContain("Culture");
    expect(view).toContain("Inherited article description.");
    expect(view).toContain("Optional editorial copy.");
    expect(view).toContain('data-home-featured-active="true"');
  });

  test("renders link feature action labels without article metadata", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeFeaturedSlide, {
      props: {
        index: 1,
        item: featuredItem({
          href: "https://discord.gg/8MVFRMa",
          kind: "link",
          linkLabel: "Join Discord",
          title: "Join the TPM Discord",
        }),
      },
      request: new Request(`${testSiteUrl}/`),
    });

    expect(view).toContain("Join the TPM Discord");
    expect(view).toContain("Join Discord");
    expect(view).toContain("https://discord.gg/8MVFRMa");
    expect(view).toContain("hidden");
    expect(view).not.toContain("Culture");
  });
});

function featuredItem(
  overrides: Partial<HomeFeaturedItem> = {},
): HomeFeaturedItem {
  return {
    entry: {
      body: "",
      collection: "homeFeatured",
      data: {
        active: true,
        kind: "link",
        link: "https://example.com",
        linkLabel: "Read",
        order: 10,
        title: "Feature",
      },
      id: "feature",
    },
    href: "https://example.com",
    id: "feature",
    kind: "link",
    linkLabel: "Read",
    title: "Feature",
    ...overrides,
  };
}
