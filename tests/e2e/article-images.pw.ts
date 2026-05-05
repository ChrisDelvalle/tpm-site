import { expect, test } from "@playwright/test";

import {
  expectHorizontallyContained,
  expectNoHorizontalOverflow,
  viewportMatrix,
  visibleBoundingBox,
} from "./helpers/layout";

const representativeImageRoutes = [
  "/articles/kandinsky-and-loss/",
  "/articles/memes-jokes-and-visual-puns/",
  "/articles/the-post-pepe-manifesto/",
  "/articles/what-is-a-meme/",
  "/articles/twitch-plays-pokemon/",
] as const;

test.describe("article image invariants", () => {
  test("standalone Markdown images become editorial figures without disrupting inline images", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/articles/memes-jokes-and-visual-puns/");

    const prose = page.locator("[data-article-prose]");
    const figures = prose.locator("figure[data-article-image-figure]");
    const squareFigure = prose
      .locator('figure[data-article-image-shape="square"]')
      .first();

    await expect(figures.first()).toBeVisible();
    await expect(
      page.locator("p > figure[data-article-image-figure]"),
    ).toHaveCount(0);
    await expect(squareFigure).toBeVisible();
    await expect(squareFigure).toHaveAttribute(
      "data-article-image-inspectable",
      "false",
    );
    await expectHorizontallyContained(squareFigure, prose, {
      inner: "square article image figure",
      outer: "article prose",
    });

    const squareImageBox = await visibleBoundingBox(
      squareFigure.locator("img[data-article-image]"),
      "square article image",
    );
    expect(squareImageBox.width).toBeLessThanOrEqual(548);

    await page.goto("/articles/early-trash-dove/");
    const inlineImages = page.locator('blockquote p img[src*="emoji.php"]');
    await expect(inlineImages).toHaveCount(2);
    await expect(
      page.locator("blockquote p figure[data-article-image-figure]"),
    ).toHaveCount(0);
    await expect(inlineImages.first()).not.toHaveAttribute(
      "data-article-image",
      "true",
    );
    await expectNoHorizontalOverflow(page);
  });

  test("tall Markdown images use square-height previews with inspection", async ({
    page,
  }) => {
    for (const viewport of [
      { height: 900, width: 1280 },
      { height: 740, width: 390 },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/articles/kandinsky-and-loss/");

      const prose = page.locator("[data-article-prose]");
      const figure = prose.locator('figure[data-article-image-shape="tall"]');
      const trigger = figure.locator("[data-article-image-inspect-trigger]");

      await expect(figure).toBeVisible();
      await expect(figure).toHaveAttribute(
        "data-article-image-inspectable",
        "true",
      );
      await expect(trigger).toBeVisible();
      await expectHorizontallyContained(figure, prose, {
        inner: "tall article image figure",
        outer: "article prose",
      });

      const previewBox = await visibleBoundingBox(
        trigger,
        "tall article image preview",
      );
      expect(previewBox.width).toBeLessThanOrEqual(
        Math.min(viewport.width - 32, 420),
      );
      expect(previewBox.height).toBeLessThanOrEqual(
        Math.min(viewport.height * 0.7, 544) + 4,
      );
      await expectNoHorizontalOverflow(page);
    }
  });

  for (const route of representativeImageRoutes) {
    test(`${route} keeps article figures contained at key reading widths`, async ({
      page,
    }) => {
      for (const viewport of viewportMatrix) {
        await page.setViewportSize({
          height: viewport.height,
          width: viewport.width,
        });
        await page.goto(route);

        const prose = page.locator("[data-article-prose]");
        const figures = prose.locator("figure[data-article-image-figure]");
        const figureCount = await figures.count();

        expect(figureCount).toBeGreaterThan(0);

        for (let index = 0; index < Math.min(figureCount, 3); index += 1) {
          await expectHorizontallyContained(figures.nth(index), prose, {
            inner: `${route} article figure ${index + 1}`,
            outer: "article prose",
          });
        }

        await expectNoHorizontalOverflow(page);
      }
    });
  }
});
