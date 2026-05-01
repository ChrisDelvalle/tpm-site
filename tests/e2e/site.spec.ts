import { expect, test } from "@playwright/test";

import {
  expectElementAtViewportPoint,
  expectFocusVisible,
  expectNoHorizontalOverflow,
  scrollToY,
  viewportMatrix,
  visibleBoundingBox,
} from "./helpers/layout";

const keyRoutes = [
  "/",
  "/articles/",
  "/articles/gamergate-as-metagaming/",
  "/categories/",
  "/categories/history/",
  "/about/",
  "/search/",
];

const smokeRoutes = [...keyRoutes, "/404.html"];

function sitemapLocPathnames(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gu), (match) =>
    sitemapLocPathname(match[1] ?? ""),
  );
}

function sitemapLocPathname(loc: string): string {
  const pathWithOptionalSlash = loc.replace(/^https?:\/\/[^/]+/iu, "");
  return pathWithOptionalSlash.startsWith("/")
    ? pathWithOptionalSlash
    : `/${pathWithOptionalSlash}`;
}

for (const route of smokeRoutes) {
  test(`renders ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });
}

test("serves the RSS feed", async ({ request }) => {
  const response = await request.get("/feed.xml");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("xml");
  expect(await response.text()).toContain("<rss");
});

test("sitemap-listed pages are generated and reachable", async ({
  request,
}) => {
  const indexResponse = await request.get("/sitemap-index.xml");
  expect(indexResponse.ok()).toBe(true);

  const indexXml = await indexResponse.text();
  const sitemapPaths = sitemapLocPathnames(indexXml).filter((pathname) =>
    pathname.endsWith(".xml"),
  );

  expect(sitemapPaths.length).toBeGreaterThan(0);

  const pagePaths: string[] = [];
  for (const sitemapPath of sitemapPaths) {
    const sitemapResponse = await request.get(sitemapPath);
    expect(sitemapResponse.ok()).toBe(true);

    const sitemapXml = await sitemapResponse.text();
    pagePaths.push(...sitemapLocPathnames(sitemapXml));
  }

  expect(pagePaths.length).toBeGreaterThan(50);
  for (const pagePath of pagePaths) {
    const response = await request.get(pagePath);
    expect(response.ok(), `${pagePath} should render`).toBe(true);
  }
});

for (const route of keyRoutes) {
  test(`has semantic document landmarks on ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator("main#content")).toHaveCount(1);
    await expect(page.locator('a.skip-link[href="#content"]')).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Footer navigation" }),
    ).toBeVisible();
  });
}

for (const viewport of viewportMatrix) {
  for (const route of keyRoutes) {
    test(`has no horizontal overflow on ${route} at ${viewport.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await page.goto(route);

      await expectNoHorizontalOverflow(page);
      expect(await page.evaluate(() => window.location.pathname)).toBe(route);
    });
  }
}

test("keyboard focus is visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const focused = await expectFocusVisible(page);
  await expect(focused).toHaveCount(1);
});

test("desktop sticky sidebar stays below sticky header", async ({ page }) => {
  const viewportHeight = 900;

  await page.setViewportSize({ height: viewportHeight, width: 1280 });
  await page.goto("/articles/gamergate-as-metagaming/");

  await scrollToY(page, 600);

  const headerBox = await visibleBoundingBox(
    page.locator("[data-site-header]"),
    "sticky header",
  );
  const sidebar = page.locator('aside[aria-label="Category navigation"]');
  const sidebarBox = await visibleBoundingBox(
    sidebar,
    "desktop category sidebar",
  );
  const headerBottom = headerBox.y + headerBox.height;

  expect(sidebarBox.y).toBeGreaterThanOrEqual(headerBottom - 1);
  expect(sidebarBox.height).toBeLessThanOrEqual(
    viewportHeight - headerBottom + 1,
  );
  await expectElementAtViewportPoint(
    sidebar,
    {
      x: sidebarBox.x + Math.min(sidebarBox.width / 2, 32),
      y: sidebarBox.y + 12,
    },
    "desktop category sidebar",
  );
});

test("category disclosure toggles article links without navigation", async ({
  page,
}) => {
  await page.goto("/");

  const categoryNav = page.getByLabel("Desktop category navigation");
  const group = categoryNav.locator("details", {
    has: page.locator("summary", { hasText: "Memeculture" }),
  });
  await expect(group).not.toHaveAttribute("open", "");

  await group.locator("summary").click();
  await expect(group).toHaveAttribute("open", "");
  await expect(
    group.getByRole("link", { name: /View all Memeculture/ }),
  ).toBeVisible();
  await expect(page).toHaveURL("/");

  await group.locator("summary").click();
  await expect(group).not.toHaveAttribute("open", "");
  await expect(page).toHaveURL("/");
});

test("mobile navigation exposes primary and category links", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");

  const menu = page.locator("header details").first();
  await expect(menu).not.toHaveAttribute("open", "");
  await page.getByLabel("Open navigation menu").click();
  await expect(menu).toHaveAttribute("open", "");

  const mobileNav = page.getByLabel("Mobile primary navigation");
  await expect(mobileNav.getByRole("link", { name: "Articles" })).toBeVisible();
  await expect(
    mobileNav.getByRole("link", { name: "Categories" }),
  ).toBeVisible();
  await expect(page.getByLabel("Mobile category navigation")).toContainText(
    "Metamemetics",
  );

  await page.getByLabel("Open navigation menu").click();
  await expect(menu).not.toHaveAttribute("open", "");
});

test("theme toggle switches the document theme", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator(".theme-toggle").first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("search returns built Pagefind results", async ({ page }) => {
  await page.goto("/search/?q=gamergate");
  await expect(page.locator(".search-result").first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(".search-result").first()).toContainText(
    "GamerGate As Metagaming",
  );
});
