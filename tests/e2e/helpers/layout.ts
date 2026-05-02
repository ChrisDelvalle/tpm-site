import { expect, type Locator, type Page } from "@playwright/test";

/** Rectangle values returned by Playwright for visible elements. */
export interface ElementBox {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/** Shared viewport matrix for responsive layout invariants. */
export const viewportMatrix = [
  { height: 844, label: "mobile", width: 390 },
  { height: 560, label: "short mobile", width: 390 },
  { height: 1024, label: "tablet", width: 768 },
  { height: 900, label: "desktop", width: 1280 },
  { height: 1200, label: "wide desktop", width: 2560 },
] as const;

/**
 * Returns a visible element bounding box and fails with a useful label when the
 * element is missing or not visible.
 *
 * @param locator Playwright locator for the expected visible element.
 * @param label Human-readable element name for failure messages.
 * @returns Visible element box.
 */
export async function visibleBoundingBox(
  locator: Locator,
  label: string,
): Promise<ElementBox> {
  const box = await locator.boundingBox();

  if (box === null) {
    throw new Error(`Expected ${label} to have a visible bounding box.`);
  }

  return box;
}

/**
 * Asserts that the current page has no unintended horizontal overflow.
 *
 * @param page Current Playwright page.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth - documentElement.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}

/**
 * Asserts that one element is horizontally contained inside another.
 *
 * @param inner Element expected to stay inside the outer element.
 * @param outer Containing element.
 * @param labels Human-readable names for failure messages.
 * @param labels.inner Human-readable inner element name.
 * @param labels.outer Human-readable outer element name.
 * @param tolerance Pixel tolerance for subpixel rounding.
 */
export async function expectHorizontallyContained(
  inner: Locator,
  outer: Locator,
  labels: { readonly inner: string; readonly outer: string },
  tolerance = 1,
): Promise<void> {
  const innerBox = await visibleBoundingBox(inner, labels.inner);
  const outerBox = await visibleBoundingBox(outer, labels.outer);

  expect(innerBox.x).toBeGreaterThanOrEqual(outerBox.x - tolerance);
  expect(innerBox.x + innerBox.width).toBeLessThanOrEqual(
    outerBox.x + outerBox.width + tolerance,
  );
}

/**
 * Asserts that the first element appears earlier in document flow visually.
 *
 * @param before Element expected to appear first.
 * @param after Element expected to appear after the first element.
 * @param labels Human-readable names for failure messages.
 * @param labels.after Human-readable after element name.
 * @param labels.before Human-readable before element name.
 * @param tolerance Pixel tolerance for subpixel rounding.
 */
export async function expectVerticallyBefore(
  before: Locator,
  after: Locator,
  labels: { readonly after: string; readonly before: string },
  tolerance = 1,
): Promise<void> {
  const beforeBox = await visibleBoundingBox(before, labels.before);
  const afterBox = await visibleBoundingBox(after, labels.after);

  expect(beforeBox.y + beforeBox.height).toBeLessThanOrEqual(
    afterBox.y + tolerance,
  );
}

/**
 * Asserts that two visible elements do not overlap.
 *
 * @param first First visible element.
 * @param second Second visible element.
 * @param labels Human-readable names for failure messages.
 * @param labels.first Human-readable first element name.
 * @param labels.second Human-readable second element name.
 * @param tolerance Pixel tolerance for subpixel rounding.
 */
export async function expectNoOverlap(
  first: Locator,
  second: Locator,
  labels: { readonly first: string; readonly second: string },
  tolerance = 1,
): Promise<void> {
  const firstBox = await visibleBoundingBox(first, labels.first);
  const secondBox = await visibleBoundingBox(second, labels.second);
  const separatedHorizontally =
    firstBox.x + firstBox.width <= secondBox.x + tolerance ||
    secondBox.x + secondBox.width <= firstBox.x + tolerance;
  const separatedVertically =
    firstBox.y + firstBox.height <= secondBox.y + tolerance ||
    secondBox.y + secondBox.height <= firstBox.y + tolerance;

  expect(separatedHorizontally || separatedVertically).toBe(true);
}

/**
 * Scrolls the viewport to a specific vertical offset.
 *
 * @param page Current Playwright page.
 * @param y Vertical scroll offset in CSS pixels.
 */
export async function scrollToY(page: Page, y: number): Promise<void> {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
}

/**
 * Asserts that keyboard focus is visible on the page.
 *
 * @param page Current Playwright page.
 * @returns Locator for the focused visible element.
 */
export async function expectFocusVisible(page: Page): Promise<Locator> {
  const focused = page.locator(":focus-visible").first();
  await expect(focused).toBeVisible();

  const focusStyles = await focused.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      boxShadow: styles.boxShadow,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
    };
  });
  const hasVisibleOutline =
    focusStyles.outlineStyle !== "none" && focusStyles.outlineWidth !== "0px";
  const hasVisibleRing = focusStyles.boxShadow !== "none";

  expect(hasVisibleOutline || hasVisibleRing).toBe(true);

  return focused;
}

/**
 * Asserts that the target element is the topmost element at a viewport point.
 *
 * @param locator Element expected to own the point.
 * @param point Viewport point to inspect.
 * @param point.x Horizontal viewport coordinate.
 * @param point.y Vertical viewport coordinate.
 * @param label Human-readable element name for failure messages.
 */
export async function expectElementAtViewportPoint(
  locator: Locator,
  point: { readonly x: number; readonly y: number },
  label: string,
): Promise<void> {
  const ownsPoint = await locator.evaluate((element, viewportPoint) => {
    const topElement = document.elementFromPoint(
      viewportPoint.x,
      viewportPoint.y,
    );
    return topElement !== null && element.contains(topElement);
  }, point);

  expect(ownsPoint, `${label} should be topmost at the tested point`).toBe(
    true,
  );
}
