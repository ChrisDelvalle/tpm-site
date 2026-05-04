import { expect, type Page, test } from "@playwright/test";

import {
  expectApproximatelyEqual,
  expectCenteredInViewport,
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

async function expectHashTargetBelowHeader(
  page: Page,
  targetSelector: string,
): Promise<void> {
  const headerBox = await visibleBoundingBox(
    page.locator("[data-site-header]"),
    "site header",
  );
  const targetBox = await visibleBoundingBox(
    page.locator(targetSelector),
    "hash target heading",
  );
  const minimumY = headerBox.y + headerBox.height + 8;

  expect(targetBox.y).toBeGreaterThanOrEqual(minimumY);
  expect(targetBox.y).toBeLessThanOrEqual(minimumY + 112);
}

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
    for (const viewport of [
      { height: 900, width: 1280 },
      { height: 1000, width: 1800 },
      { height: 1200, width: 2560 },
    ] as const) {
      await page.setViewportSize(viewport);
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
      await expectCenteredInViewport(
        page,
        contentColumn,
        "reading content column with TOC visible",
      );
      await expectNoHorizontalOverflow(page);
    }
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
    await expect(firstLink).toHaveAttribute("data-current", "true");
    await expect(firstLink).toHaveAttribute("aria-current", "location");
    await expectHashTargetBelowHeader(page, "#facebook-as-a-platform");
  });

  test("article direct hash navigation keeps target headings below the sticky header", async ({
    page,
  }) => {
    for (const viewport of [
      { height: 844, width: 390 },
      { height: 1024, width: 768 },
      { height: 900, width: 1280 },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/articles/facebook-groups/#facebook-as-a-platform");
      await expect(page.locator("#facebook-as-a-platform")).toBeVisible();
      await expectHashTargetBelowHeader(page, "#facebook-as-a-platform");
    }
  });

  test("article table of contents collapse keeps the reading column centered on mobile and tablet", async ({
    page,
  }) => {
    for (const viewport of [
      { height: 844, width: 390 },
      { height: 1024, width: 768 },
      { height: 900, width: 1024 },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/articles/facebook-groups/");

      const contentColumn = page.locator("[data-margin-sidebar-content]");

      await expect(page.locator("[data-article-toc]")).toBeHidden();
      await expectCenteredInViewport(
        page,
        contentColumn,
        "reading content column without visible TOC",
      );
      await expectNoHorizontalOverflow(page);
    }
  });

  test("site header keeps category discovery on one locked-height row", async ({
    page,
  }) => {
    const expectedCategoryLabels = [
      "Culture",
      "Metamemetics",
      "Aesthetics",
      "Irony",
      "Game Studies",
      "History",
      "Philosophy",
      "Politics",
    ];

    for (const viewport of [
      {
        height: 1024,
        maxCategoryFontSize: 12.1,
        minCategoryFontSize: 0,
        width: 768,
      },
      {
        height: 900,
        maxCategoryFontSize: 12.1,
        minCategoryFontSize: 0,
        width: 900,
      },
      {
        height: 900,
        maxCategoryFontSize: 99,
        minCategoryFontSize: 13.9,
        width: 1024,
      },
      {
        height: 900,
        maxCategoryFontSize: 99,
        minCategoryFontSize: 13.9,
        width: 1280,
      },
      {
        height: 1100,
        maxCategoryFontSize: 99,
        minCategoryFontSize: 13.9,
        width: 1800,
      },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      const header = page.locator("[data-site-header]");
      const brand = page.locator("[data-brand-link]");
      const brandLabel = brand.locator("[data-brand-label]");
      const searchTrigger = page.locator("[data-search-reveal-trigger]");
      const themeToggle = header.locator(".theme-toggle").first();
      const primaryNav = page.getByRole("navigation", {
        name: "Primary navigation",
      });
      const support = header.locator("[data-support-link]");
      const primaryRow = page.locator("[data-site-header-primary-row]");
      const priorityCenter = primaryRow.locator(
        "[data-priority-inline-center]",
      );
      const categoryRow = page.locator("[data-site-header-category-row]");
      const categoryList = page.locator("[data-discovery-menu-list]");
      const categoryTriggers = page.locator(
        "[data-category-dropdown] [data-anchor-trigger]",
      );
      const headerBox = await visibleBoundingBox(header, "site header");
      const brandBox = await visibleBoundingBox(brand, "brand link");
      const primaryRowBox = await visibleBoundingBox(
        primaryRow,
        "primary header row",
      );
      const priorityCenterBox = await visibleBoundingBox(
        priorityCenter,
        "priority row center slot",
      );
      const rowBox = await visibleBoundingBox(categoryRow, "category row");
      const listBox = await visibleBoundingBox(categoryList, "category list");
      const brandMetrics = await brandLabel.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      const triggerRows = await categoryTriggers.evaluateAll((elements) =>
        elements
          .map((element) => element.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .map((rect) => ({
            bottom: rect.bottom,
            top: rect.top,
          })),
      );
      const categoryLabels = await categoryTriggers.evaluateAll((elements) =>
        elements.map((element) => {
          const label = element.querySelector("span");

          if (label === null) {
            throw new Error("Expected category trigger to render a label.");
          }

          const styles = window.getComputedStyle(label);

          return {
            clientWidth: label.clientWidth,
            fontSize: Number.parseFloat(styles.fontSize),
            scrollWidth: label.scrollWidth,
            text: label.textContent.trim(),
            textOverflow: styles.textOverflow,
          };
        }),
      );

      expect(triggerRows.length).toBeGreaterThan(0);
      await expect(primaryRow).toHaveAttribute("data-priority-inline-row", "");
      await expect(
        primaryRow.locator("[data-priority-inline-start]"),
      ).toHaveCount(1);
      await expect(priorityCenter).toHaveCount(1);
      await expect(
        primaryRow.locator("[data-priority-inline-end]"),
      ).toHaveCount(1);
      await expect(brandLabel).toHaveText("The Philosopher's Meme");
      expectApproximatelyEqual(
        brandBox.x + brandBox.width / 2,
        headerBox.x + headerBox.width / 2,
      );
      expectApproximatelyEqual(
        priorityCenterBox.x + priorityCenterBox.width / 2,
        headerBox.x + headerBox.width / 2,
      );
      expect(brandMetrics.scrollWidth).toBeLessThanOrEqual(
        brandMetrics.clientWidth + 1,
      );
      await expectNoOverlap(searchTrigger, brand, {
        first: "search trigger",
        second: "brand link",
      });
      await expectNoOverlap(themeToggle, brand, {
        first: "theme toggle",
        second: "brand link",
      });
      await expectNoOverlap(brand, primaryNav, {
        first: "brand link",
        second: "primary navigation",
      });
      await expectNoOverlap(brand, support, {
        first: "brand link",
        second: "support link",
      });
      expect(categoryLabels.map((label) => label.text)).toStrictEqual(
        expectedCategoryLabels,
      );
      for (const label of categoryLabels) {
        expect(label.textOverflow).not.toBe("ellipsis");
        expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
      }
      expect(
        Math.max(...categoryLabels.map((label) => label.fontSize)),
      ).toBeLessThanOrEqual(viewport.maxCategoryFontSize);
      expect(
        Math.min(...categoryLabels.map((label) => label.fontSize)),
      ).toBeGreaterThanOrEqual(viewport.minCategoryFontSize);
      expect(headerBox.height).toBeLessThanOrEqual(104);
      expect(primaryRowBox.height).toBeLessThanOrEqual(40);
      expect(rowBox.height).toBeLessThanOrEqual(28);
      expect(listBox.height).toBeLessThanOrEqual(rowBox.height + 1);
      expect(
        Math.max(...triggerRows.map((row) => row.top)) -
          Math.min(...triggerRows.map((row) => row.top)),
      ).toBeLessThanOrEqual(2);
      expect(
        Math.max(...triggerRows.map((row) => row.bottom)) -
          Math.min(...triggerRows.map((row) => row.bottom)),
      ).toBeLessThanOrEqual(2);
      await expectHorizontallyContained(categoryList, header, {
        inner: "category list",
        outer: "site header",
      });
      await expectNoHorizontalOverflow(page);
    }
  });

  test("mobile header keeps discovery in the menu without exposing the desktop category row", async ({
    page,
  }) => {
    for (const viewport of [
      {
        compactSupportVisible: true,
        fullSupportVisible: false,
        height: 568,
        width: 320,
      },
      {
        compactSupportVisible: true,
        fullSupportVisible: false,
        height: 740,
        width: 360,
      },
      {
        compactSupportVisible: false,
        fullSupportVisible: true,
        height: 844,
        width: 390,
      },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      const header = page.locator("[data-site-header]");
      const menuButton = page.getByLabel("Open navigation menu");
      const brand = page.locator("[data-brand-link]");
      const brandLabel = brand.locator("[data-brand-label]");
      const support = header.locator("[data-support-link]");
      const fullSupportLabel = support.locator("[data-support-label-full]");
      const compactSupportLabel = support.locator(
        "[data-support-label-compact]",
      );
      const primaryRow = page.locator("[data-site-header-primary-row]");
      const priorityCenter = primaryRow.locator(
        "[data-priority-inline-center]",
      );
      const headerBox = await visibleBoundingBox(header, "mobile site header");
      const brandBox = await visibleBoundingBox(brand, "mobile brand link");
      const priorityCenterBox = await visibleBoundingBox(
        priorityCenter,
        "mobile priority row center slot",
      );
      const brandLabelMetrics = await brandLabel.evaluate((element) => ({
        clientWidth: element.clientWidth,
        fontSize: Number.parseFloat(window.getComputedStyle(element).fontSize),
        scrollWidth: element.scrollWidth,
      }));
      const supportLabelState = await support.evaluate((element) => {
        const fullLabel = element.querySelector("[data-support-label-full]");
        const compactLabel = element.querySelector(
          "[data-support-label-compact]",
        );

        if (fullLabel === null || compactLabel === null) {
          throw new Error(
            "Expected header support link to render both labels.",
          );
        }

        return {
          compactText: compactLabel.textContent.trim(),
          compactVisible:
            window.getComputedStyle(compactLabel).display !== "none",
          fullText: fullLabel.textContent.trim(),
          fullVisible: window.getComputedStyle(fullLabel).display !== "none",
        };
      });

      expect(headerBox.height).toBeLessThanOrEqual(72);
      await expect(page.locator("[data-discovery-menu]")).toBeHidden();
      await expect(primaryRow).toHaveAttribute("data-priority-inline-row", "");
      await expect(
        primaryRow.locator("[data-priority-inline-start]"),
      ).toHaveCount(1);
      await expect(priorityCenter).toHaveCount(1);
      await expect(
        primaryRow.locator("[data-priority-inline-end]"),
      ).toHaveCount(1);
      await expect(menuButton).toBeVisible();
      await expect(brand).toBeVisible();
      await expect(brandLabel).toHaveText("The Philosopher's Meme");
      await expect(support).toBeVisible();
      await expect(fullSupportLabel).toHaveText("Support Us");
      await expect(compactSupportLabel).toHaveText("Patreon");
      expect(supportLabelState).toStrictEqual({
        compactText: "Patreon",
        compactVisible: viewport.compactSupportVisible,
        fullText: "Support Us",
        fullVisible: viewport.fullSupportVisible,
      });
      expectApproximatelyEqual(
        brandBox.x + brandBox.width / 2,
        headerBox.x + headerBox.width / 2,
      );
      expectApproximatelyEqual(
        priorityCenterBox.x + priorityCenterBox.width / 2,
        headerBox.x + headerBox.width / 2,
      );
      expect(brandLabelMetrics.scrollWidth).toBeLessThanOrEqual(
        brandLabelMetrics.clientWidth + 1,
      );
      expect(brandLabelMetrics.fontSize).toBeGreaterThanOrEqual(
        viewport.width === 320 ? 12 : 13.5,
      );
      expect(brandLabelMetrics.fontSize).toBeLessThanOrEqual(14.5);
      await expectNoOverlap(menuButton, brand, {
        first: "mobile menu button",
        second: "brand link",
      });
      await expectNoOverlap(brand, support, {
        first: "brand link",
        second: "support link",
      });
      await expectHorizontallyContained(menuButton, header, {
        inner: "mobile menu button",
        outer: "mobile site header",
      });
      await expectHorizontallyContained(brand, header, {
        inner: "brand link",
        outer: "mobile site header",
      });
      await expectHorizontallyContained(support, header, {
        inner: "support link",
        outer: "mobile site header",
      });
      await expectNoHorizontalOverflow(page);
    }
  });

  test("header interactions do not move the centered brand", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 1024, width: 768 });
    await page.goto("/");

    const header = page.locator("[data-site-header]");
    const brand = page.locator("[data-brand-link]");
    const searchTrigger = page.locator("[data-search-reveal-trigger]");
    const categoryTrigger = page
      .locator("[data-category-dropdown] [data-anchor-trigger]")
      .first();
    const themeToggle = header.locator(".theme-toggle").first();

    await expect(brand).toBeVisible();
    await expect(searchTrigger).toBeVisible();
    await expect(categoryTrigger).toBeVisible();
    await expect(themeToggle).toBeVisible();

    async function headerCenter(): Promise<number> {
      const box = await visibleBoundingBox(header, "site header");

      return box.x + box.width / 2;
    }

    async function brandCenter(): Promise<number> {
      const box = await visibleBoundingBox(brand, "brand link");

      return box.x + box.width / 2;
    }

    const initialHeaderCenter = await headerCenter();
    const initialBrandCenter = await brandCenter();

    expectApproximatelyEqual(initialBrandCenter, initialHeaderCenter);

    await searchTrigger.click();
    expectApproximatelyEqual(await brandCenter(), initialHeaderCenter);

    await categoryTrigger.hover();
    expectApproximatelyEqual(await brandCenter(), initialHeaderCenter);

    await themeToggle.click();
    expectApproximatelyEqual(await brandCenter(), initialHeaderCenter);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");

    const mobileHeader = page.locator("[data-site-header]");
    const mobileBrand = page.locator("[data-brand-link]");
    const menuButton = page.getByLabel("Open navigation menu");

    await expect(mobileBrand).toBeVisible();
    await expect(menuButton).toBeVisible();

    const mobileHeaderBox = await visibleBoundingBox(
      mobileHeader,
      "mobile site header",
    );
    const mobileBrandBox = await visibleBoundingBox(
      mobileBrand,
      "mobile brand link",
    );
    const mobileHeaderCenter = mobileHeaderBox.x + mobileHeaderBox.width / 2;

    expectApproximatelyEqual(
      mobileBrandBox.x + mobileBrandBox.width / 2,
      mobileHeaderCenter,
    );

    await menuButton.click();

    const openMobileBrandBox = await visibleBoundingBox(
      mobileBrand,
      "open mobile brand link",
    );

    expectApproximatelyEqual(
      openMobileBrandBox.x + openMobileBrandBox.width / 2,
      mobileHeaderCenter,
    );
    await expectNoHorizontalOverflow(page);
  });

  test("category discovery panels stay viewport-constrained at tablet and desktop widths", async ({
    page,
  }) => {
    for (const viewport of [
      { height: 1024, width: 768 },
      { height: 900, width: 1280 },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      const discovery = page.locator("[data-discovery-menu]");
      const firstCategory = page.locator("[data-category-dropdown]").first();
      const firstCategoryLink = firstCategory.getByRole("link").first();
      const preview = firstCategory.locator("[data-category-preview]");

      await expect(discovery).toBeVisible();
      await firstCategoryLink.hover();
      await expect(preview).toBeVisible();

      const headerBox = await visibleBoundingBox(
        page.locator("[data-site-header]"),
        "site header",
      );
      const previewBox = await visibleBoundingBox(
        preview,
        "category preview panel",
      );

      expect(previewBox.x).toBeGreaterThanOrEqual(0);
      expect(previewBox.x + previewBox.width).toBeLessThanOrEqual(
        viewport.width,
      );
      expect(previewBox.y).toBeGreaterThanOrEqual(
        headerBox.y + headerBox.height - 1,
      );
      expect(previewBox.y + previewBox.height).toBeLessThanOrEqual(
        viewport.height,
      );
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
