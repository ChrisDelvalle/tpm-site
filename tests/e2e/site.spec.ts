import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/articles/",
  "/articles/gamergate-as-metagaming/",
  "/articles/misattributed-plato-quote-is-real-now/",
  "/categories/history/",
  "/about/",
  "/404.html",
];

for (const route of routes) {
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

const viewports = [
  { height: 844, label: "mobile", width: 390 },
  { height: 1024, label: "tablet", width: 768 },
  { height: 900, label: "laptop", width: 1280 },
  { height: 1080, label: "desktop", width: 1920 },
  { height: 1200, label: "wide", width: 2560 },
];

for (const viewport of viewports) {
  test(`has no horizontal overflow at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({
      height: viewport.height,
      width: viewport.width,
    });
    await page.goto("/articles/gamergate-as-metagaming/");

    const overflow = await page.evaluate(() => {
      const documentElement = document.documentElement;
      return documentElement.scrollWidth - documentElement.clientWidth;
    });

    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("mobile navigation exposes primary and category links", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");
  await page.getByLabel("Open navigation menu").click();

  const mobileNav = page.getByLabel("Mobile primary navigation");
  await expect(mobileNav.getByRole("link", { name: "Articles" })).toBeVisible();
  await expect(
    mobileNav.getByRole("link", { name: "Categories" }),
  ).toBeVisible();
  await expect(page.locator(".mobile-category-nav")).toContainText(
    "Metamemetics",
  );
});

test("theme toggle switches the document theme", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator(".theme-toggle").first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
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
