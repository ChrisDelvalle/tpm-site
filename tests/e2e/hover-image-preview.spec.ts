import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  expectInlineStartAligned,
  expectNoHorizontalOverflow,
  expectViewportContained,
} from "./helpers/layout";

const articleWithHoverImages = "/articles/social-media-freedom/";

/**
 * Opens the hover-image preview at the provided index.
 *
 * @param page Current Playwright page.
 * @param index Hover-image trigger index.
 * @returns Trigger and panel locators.
 */
async function openHoverPreview(
  page: Page,
  index: number,
): Promise<{ readonly panel: Locator; readonly trigger: Locator }> {
  const card = page.locator("[data-hover-image-card]").nth(index);
  const trigger = card.locator("[data-hover-image-trigger]");
  const panel = card.locator("[data-hover-image-panel]");

  await trigger.hover();
  await expect(panel).toBeVisible();

  return { panel, trigger };
}

/**
 * Returns the hover-image trigger closest to the right viewport edge.
 *
 * @param page Current Playwright page.
 * @returns Locator for the rightmost trigger.
 */
async function rightmostHoverTrigger(page: Page): Promise<Locator> {
  const triggerIndex = await page
    .locator("[data-hover-image-trigger]")
    .evaluateAll((elements) => {
      const indexedElements = elements.map((element, index) => ({
        index,
        right: element.getBoundingClientRect().right,
      }));
      const rightmost = indexedElements.reduce(
        (current, next) => (next.right > current.right ? next : current),
        { index: 0, right: Number.NEGATIVE_INFINITY },
      );

      return rightmost.index;
    });

  return page.locator("[data-hover-image-trigger]").nth(triggerIndex);
}

test.describe("native Astro hover-image previews", () => {
  test("stay inline, anchored, and viewport-contained on desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto(articleWithHoverImages);

    const { panel, trigger } = await openHoverPreview(page, 0);

    await expectInlineStartAligned(trigger, panel);
    await expect(panel.locator("img")).toHaveAttribute("loading", "lazy");
    await expectViewportContained(page, panel, "hover-image panel");
    await expectNoHorizontalOverflow(page);
  });

  test("shift into the viewport near the left edge on mobile widths", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 720, width: 390 });
    await page.goto(articleWithHoverImages);

    const { panel } = await openHoverPreview(page, 0);

    await expect(panel).toHaveAttribute("data-anchor-detached", "false");
    await expectViewportContained(page, panel, "hover-image panel");
    await expectNoHorizontalOverflow(page);
  });

  test("remain viewport-contained near the right edge in dark mode", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 760, width: 900 });
    await page.goto(articleWithHoverImages);
    await page.locator(".theme-toggle").first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    const trigger = await rightmostHoverTrigger(page);
    await trigger.scrollIntoViewIfNeeded();
    const panel = trigger
      .locator("xpath=ancestor::*[@data-hover-image-card][1]")
      .locator("[data-hover-image-panel]");

    await trigger.hover();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-anchor-detached", "false");
    await expectViewportContained(page, panel, "hover-image panel");
    await expectNoHorizontalOverflow(page);
  });

  test("flip above the trigger when bottom space is insufficient", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 520, width: 900 });
    await page.goto(articleWithHoverImages);

    const trigger = page.locator("[data-hover-image-trigger]").first();
    await trigger.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      window.scrollBy({
        top: rect.bottom - window.innerHeight + 32,
      });
    });

    const panel = trigger
      .locator("xpath=ancestor::*[@data-hover-image-card][1]")
      .locator("[data-hover-image-panel]");

    await trigger.hover();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-anchor-placement", "top-start");
    await expectViewportContained(page, panel, "hover-image panel");
  });
});
