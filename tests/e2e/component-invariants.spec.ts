import { expect, test } from "@playwright/test";

import {
  expectFocusVisible,
  expectHorizontallyContained,
  expectNoHorizontalOverflow,
  expectNoOverlap,
  expectVerticallyBefore,
  scrollToY,
  visibleBoundingBox,
} from "./helpers/layout";

const archiveRoutes = [
  "/articles/",
  "/articles/all/",
  "/categories/",
  "/categories/metamemetics/",
  "/search/",
] as const;

test.describe("component layout invariants", () => {
  for (const route of archiveRoutes) {
    test(`${route} keeps a comfortable page measure on wide screens`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 1200, width: 2560 });
      await page.goto(route);

      const pageFrame = page.locator("[data-page-frame]").first();
      const main = page.locator("main").first();
      const pageFrameBox = await visibleBoundingBox(pageFrame, "page frame");

      expect(pageFrameBox.width).toBeLessThanOrEqual(1000);
      await expectHorizontallyContained(pageFrame, main, {
        inner: "page frame",
        outer: "main content",
      });
      await expectNoHorizontalOverflow(page);
    });
  }

  test("homepage discovery and support blocks share a comfortable content measure", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 1200, width: 2560 });
    await page.goto("/");

    const pageFrame = page.locator("[data-page-frame]").first();
    const categoryOverview = page.locator("[data-home-category-overview]");
    const supportBlock = page.locator("[data-support-block]").last();

    await expectHorizontallyContained(categoryOverview, pageFrame, {
      inner: "homepage category overview",
      outer: "homepage page frame",
    });
    await expectHorizontallyContained(supportBlock, pageFrame, {
      inner: "homepage support block",
      outer: "homepage page frame",
    });

    const categoryBox = await visibleBoundingBox(
      categoryOverview,
      "homepage category overview",
    );
    const supportBox = await visibleBoundingBox(
      supportBlock,
      "homepage support block",
    );
    expect(categoryBox.width).toBeGreaterThan(700);
    expect(supportBox.width).toBeGreaterThan(700);
    expect(Math.abs(categoryBox.width - supportBox.width)).toBeLessThanOrEqual(
      1,
    );
  });

  test("article end surfaces render support, category discovery, then final tags", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 1200, width: 1280 });
    await page.goto(
      "/articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/",
    );

    const prose = page.locator("[data-article-prose]");
    const endcap = page.locator(
      'article aside[aria-label="Article support and discovery"]',
    );
    const support = endcap.getByRole("heading", {
      name: "Support The Philosopher's Meme",
    });
    const moreInCategory = endcap.getByRole("heading", {
      name: /More in/,
    });
    const tags = page.locator("[data-article-tags-placement]");

    await expect(tags.getByLabel("Article tags")).toBeVisible();
    await expectVerticallyBefore(prose, support, {
      after: "support block",
      before: "article prose",
    });
    await expectVerticallyBefore(support, moreInCategory, {
      after: "more in category",
      before: "support block",
    });
    await expectVerticallyBefore(endcap, tags, {
      after: "article tags",
      before: "article endcap",
    });
  });

  test("article body starts close to the header when no hero image is rendered", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 1200, width: 1280 });
    await page.goto("/articles/the-memetic-bottleneck/");

    const headerBox = await visibleBoundingBox(
      page.locator("article > header").first(),
      "article header",
    );
    const firstProseElementBox = await visibleBoundingBox(
      page.locator("[data-article-prose] > :first-child").first(),
      "first prose element",
    );
    const headerToBodyGap =
      firstProseElementBox.y - (headerBox.y + headerBox.height);

    expect(headerToBodyGap).toBeGreaterThanOrEqual(0);
    expect(headerToBodyGap).toBeLessThanOrEqual(64);
  });

  test("article table of contents occupies the reading margin without overlaying prose", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 2560 });
    await page.goto("/articles/facebook-groups/");
    await scrollToY(page, 600);

    const headerBox = await visibleBoundingBox(
      page.locator("[data-site-header]"),
      "site header",
    );
    const toc = page.locator("[data-article-toc]");
    const prose = page.locator("[data-article-prose]");
    const contentColumn = page.locator("[data-margin-sidebar-content]");
    const tocBox = await visibleBoundingBox(toc, "article table of contents");

    expect(tocBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
    await expectNoOverlap(toc, prose, {
      first: "article table of contents",
      second: "article prose",
    });
    await expectHorizontallyContained(prose, contentColumn, {
      inner: "article prose",
      outer: "reading content column",
    });
    await expectNoHorizontalOverflow(page);
  });

  test("article table of contents hide and hash-link behavior is keyboard safe", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 2560 });
    await page.goto("/articles/facebook-groups/");

    const details = page.locator("[data-article-toc] details");
    const summary = page.locator("[data-article-toc] summary");
    const firstLink = page
      .locator("[data-article-toc]")
      .getByRole("link", { name: "Facebook as a platform" });
    const contentColumn = page.locator("[data-margin-sidebar-content]");
    const openContentBox = await visibleBoundingBox(
      contentColumn,
      "open reading content column",
    );

    await summary.focus();
    await expectFocusVisible(page);
    await page.keyboard.press("Enter");
    await expect(details).not.toHaveAttribute("open", "");

    const closedContentBox = await visibleBoundingBox(
      contentColumn,
      "closed reading content column",
    );
    expect(Math.abs(openContentBox.x - closedContentBox.x)).toBeLessThanOrEqual(
      1,
    );
    expect(
      Math.abs(openContentBox.width - closedContentBox.width),
    ).toBeLessThanOrEqual(1);

    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await firstLink.click();
    await expect(page).toHaveURL(/#facebook-as-a-platform$/u);
  });

  test("article table of contents is not a competing visible surface on mobile and tablet", async ({
    page,
  }) => {
    for (const viewport of [
      { height: 844, width: 390 },
      { height: 1024, width: 768 },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/articles/facebook-groups/");

      await expect(page.locator("[data-article-toc]")).toBeHidden();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("search result highlights render as mark elements, not escaped text", async ({
    page,
  }) => {
    await page.goto("/search/?q=gamergate");

    const firstResult = page.locator(".search-result").first();
    await expect(firstResult).toBeVisible({ timeout: 10_000 });
    await expect(firstResult.locator("mark").first()).toBeVisible();
    await expect(firstResult).not.toContainText("<mark>");
  });
});
