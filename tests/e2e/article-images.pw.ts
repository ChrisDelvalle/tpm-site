import { expect, test } from "@playwright/test";

import {
  expectApproximatelyEqual,
  expectHorizontallyContained,
  expectNoHorizontalOverflow,
  viewportMatrix,
  visibleBoundingBox,
} from "./helpers/layout";

const representativeImageRoutes = [
  "/articles/kandinsky-and-loss/",
  "/articles/memes-jokes-and-visual-puns/",
  "/articles/structure-and-content-in-drake-style-templates/",
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
    const firstFigure = figures.first();

    await expect(firstFigure).toBeVisible();
    await expect(
      page.locator("p > figure[data-article-image-figure]"),
    ).toHaveCount(0);
    await expect(firstFigure).toHaveAttribute(
      "data-article-image-policy",
      "bounded",
    );
    await expect(firstFigure).toHaveAttribute(
      "data-article-image-inspectable",
      "true",
    );
    await expect(
      firstFigure.locator("[data-article-image-inspect-trigger]"),
    ).toBeVisible();
    await expectHorizontallyContained(firstFigure, prose, {
      inner: "standalone article image figure",
      outer: "article prose",
    });

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

  test("Markdown images use square-height previews with full-screen inspection", async ({
    page,
  }) => {
    for (const viewport of [
      { height: 900, width: 1280 },
      { height: 740, width: 390 },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto("/articles/kandinsky-and-loss/");

      const prose = page.locator("[data-article-prose]");
      const figure = prose.locator("figure[data-article-image-figure]").first();
      const trigger = figure.locator("[data-article-image-inspect-trigger]");

      await expect(figure).toBeVisible();
      await expect(figure).toHaveAttribute(
        "data-article-image-policy",
        "bounded",
      );
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
        "article image preview",
      );
      const imageBox = await visibleBoundingBox(
        trigger.locator("img[data-article-image]"),
        "article image",
      );
      const affordanceBox = await visibleBoundingBox(
        trigger.locator("[data-article-image-inspect-affordance]"),
        "article image inspect affordance",
      );

      expectApproximatelyEqual(previewBox.x, imageBox.x);
      expectApproximatelyEqual(previewBox.y, imageBox.y);
      expectApproximatelyEqual(previewBox.width, imageBox.width);
      expectApproximatelyEqual(previewBox.height, imageBox.height);
      expect(affordanceBox.x + affordanceBox.width).toBeLessThanOrEqual(
        imageBox.x + imageBox.width + 1,
      );
      expect(affordanceBox.y).toBeGreaterThanOrEqual(imageBox.y - 1);
      expect(previewBox.height).toBeLessThanOrEqual(
        Math.min(viewport.height * 0.7, 544) + 4,
      );

      await trigger.click();
      const dialog = page.locator("[data-article-image-dialog]");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.locator("[data-article-image-dialog-image]"),
      ).toHaveAttribute("alt", /.+/u);
      const closeButton = dialog.locator("[data-article-image-dialog-close]");
      await expect(closeButton).toHaveAttribute(
        "aria-label",
        "Close image viewer",
      );
      await closeButton.click();
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
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
          const figure = figures.nth(index);
          await expectHorizontallyContained(figure, prose, {
            inner: `${route} article figure ${index + 1}`,
            outer: "article prose",
          });
          const imageBox = await visibleBoundingBox(
            figure.locator("img[data-article-image]"),
            `${route} article image ${index + 1}`,
          );
          const trigger = figure.locator(
            "[data-article-image-inspect-trigger]",
          );
          await expect(trigger).toBeVisible();
          const triggerBox = await visibleBoundingBox(
            trigger,
            `${route} article image trigger ${index + 1}`,
          );
          const affordanceBox = await visibleBoundingBox(
            trigger.locator("[data-article-image-inspect-affordance]"),
            `${route} article image inspect affordance ${index + 1}`,
          );

          expectApproximatelyEqual(triggerBox.x, imageBox.x);
          expectApproximatelyEqual(triggerBox.y, imageBox.y);
          expectApproximatelyEqual(triggerBox.width, imageBox.width);
          expectApproximatelyEqual(triggerBox.height, imageBox.height);
          expect(affordanceBox.x + affordanceBox.width).toBeLessThanOrEqual(
            imageBox.x + imageBox.width + 1,
          );
          expect(affordanceBox.y).toBeGreaterThanOrEqual(imageBox.y - 1);
          expect(imageBox.height).toBeLessThanOrEqual(
            Math.min(viewport.height * 0.7, 544) + 4,
          );
        }

        await expectNoHorizontalOverflow(page);
      }
    });
  }
});
