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

const defaultGeometryTolerance = 2;

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
 * Compares two CSS pixel values with a small subpixel tolerance.
 *
 * @param actual Actual pixel value.
 * @param expected Expected pixel value.
 * @param tolerance Pixel tolerance for subpixel rounding.
 */
export function expectApproximatelyEqual(
  actual: number,
  expected: number,
  tolerance = defaultGeometryTolerance,
): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

/**
 * Asserts that a floating surface stays inside viewport gutters.
 *
 * @param page Current Playwright page.
 * @param locator Floating surface locator.
 * @param label Human-readable element name for failure messages.
 * @param gutter Minimum viewport gutter in CSS pixels.
 */
export async function expectViewportContained(
  page: Page,
  locator: Locator,
  label: string,
  gutter = 0,
): Promise<void> {
  const viewport = page.viewportSize();

  if (viewport === null) {
    throw new Error("Expected Playwright viewport to be configured.");
  }

  const box = await visibleBoundingBox(locator, label);

  expect(box.x).toBeGreaterThanOrEqual(gutter);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - gutter);
  expect(box.y).toBeGreaterThanOrEqual(gutter);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - gutter);
}

/**
 * Asserts that one element's top edge touches another element's bottom edge.
 *
 * @param topElement Element expected to sit below.
 * @param bottomOfElement Element whose bottom edge is the snap line.
 * @param labels Human-readable names for failure messages.
 * @param labels.bottomOf Human-readable upper element name.
 * @param labels.top Human-readable lower element name.
 * @param tolerance Pixel tolerance for subpixel rounding.
 */
export async function expectTopAlignedToBottom(
  topElement: Locator,
  bottomOfElement: Locator,
  labels: { readonly bottomOf: string; readonly top: string },
  tolerance = defaultGeometryTolerance,
): Promise<void> {
  const topBox = await visibleBoundingBox(topElement, labels.top);
  const bottomBox = await visibleBoundingBox(bottomOfElement, labels.bottomOf);

  expectApproximatelyEqual(topBox.y, bottomBox.y + bottomBox.height, tolerance);
}

/**
 * Asserts that a panel's inline start aligns with its trigger.
 *
 * @param trigger Trigger locator.
 * @param panel Anchored panel locator.
 * @param tolerance Pixel tolerance for subpixel rounding.
 */
export async function expectInlineStartAligned(
  trigger: Locator,
  panel: Locator,
  tolerance = defaultGeometryTolerance,
): Promise<void> {
  const triggerBox = await visibleBoundingBox(trigger, "anchored trigger");
  const panelBox = await visibleBoundingBox(panel, "anchored panel");

  expectApproximatelyEqual(panelBox.x, triggerBox.x, tolerance);
}

/**
 * Asserts that a panel's inline end aligns with its trigger.
 *
 * @param trigger Trigger locator.
 * @param panel Anchored panel locator.
 * @param tolerance Pixel tolerance for subpixel rounding.
 */
export async function expectInlineEndAligned(
  trigger: Locator,
  panel: Locator,
  tolerance = defaultGeometryTolerance,
): Promise<void> {
  const triggerBox = await visibleBoundingBox(trigger, "anchored trigger");
  const panelBox = await visibleBoundingBox(panel, "anchored panel");

  expectApproximatelyEqual(
    panelBox.x + panelBox.width,
    triggerBox.x + triggerBox.width,
    tolerance,
  );
}

/**
 * Asserts that an element's horizontal center matches the viewport center.
 *
 * @param page Current Playwright page.
 * @param locator Element expected to be centered in the viewport.
 * @param label Human-readable element name for failure messages.
 * @param tolerance Pixel tolerance for subpixel rounding or scrollbar gutters.
 */
export async function expectCenteredInViewport(
  page: Page,
  locator: Locator,
  label: string,
  tolerance = defaultGeometryTolerance,
): Promise<void> {
  const viewport = page.viewportSize();

  if (viewport === null) {
    throw new Error("Expected Playwright viewport to be configured.");
  }

  const box = await visibleBoundingBox(locator, label);
  const elementCenter = box.x + box.width / 2;
  const viewportCenter = viewport.width / 2;

  expectApproximatelyEqual(elementCenter, viewportCenter, tolerance);
}

/**
 * Asserts that a header-anchored surface snaps to the sticky header bottom.
 *
 * @param page Current Playwright page.
 * @param panel Anchored panel locator.
 */
export async function expectPanelBelowHeader(
  page: Page,
  panel: Locator,
): Promise<void> {
  await expectTopAlignedToBottom(panel, page.locator("[data-site-header]"), {
    bottomOf: "site header",
    top: "anchored panel",
  });
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
