import { describe, expect, test } from "vitest";

import HomeFeaturedCarousel from "../../../../src/components/blocks/HomeFeaturedCarousel.astro";
import HomeFeaturedSlide from "../../../../src/components/blocks/HomeFeaturedSlide.astro";
import type { HomeFeaturedItem } from "../../../../src/lib/home";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("HomeFeaturedCarousel", () => {
  test("renders a static single featured item without controls", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeFeaturedCarousel, {
      props: { itemCount: 1 },
      request: new Request(`${testSiteUrl}/`),
      slots: {
        default: "<article data-home-featured-slide>Feature</article>",
      },
    });

    expect(view).toContain("Featured");
    expect(view).toContain("Feature");
    expect(view).toContain("lg:grid-rows-[auto_minmax(0,1fr)_auto]");
    expect(view).toContain("min-h-80");
    expect(view).not.toContain("data-home-featured-next");
  });

  test("renders progressive controls for multiple featured items", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeFeaturedCarousel, {
      props: { itemCount: 2 },
      request: new Request(`${testSiteUrl}/`),
      slots: {
        default:
          "<article data-home-featured-slide>One</article><article data-home-featured-slide hidden>Two</article>",
      },
    });

    expect(view).toContain("data-home-featured-next");
    expect(view).toContain("data-home-featured-indicator");
    expect(view).toContain("home-featured-carousel");
  });
});

describe("HomeFeaturedSlide", () => {
  test("renders article feature metadata and inherited description", async () => {
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
    expect(view).toContain("data-[home-featured-active=false]:invisible");
    expect(view).not.toContain("Join Discord");
  });

  test("renders link feature action labels", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeFeaturedSlide, {
      props: {
        index: 0,
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
