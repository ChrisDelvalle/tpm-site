import { expect, test } from "@playwright/test";

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

const viewports = [
  { height: 844, label: "mobile", width: 390 },
  { height: 560, label: "short mobile", width: 390 },
  { height: 1024, label: "tablet", width: 768 },
  { height: 900, label: "desktop", width: 1280 },
  { height: 1200, label: "wide desktop", width: 2560 },
];

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

for (const viewport of viewports) {
  for (const route of keyRoutes) {
    test(`has no horizontal overflow on ${route} at ${viewport.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await page.goto(route);

      const overflow = await page.evaluate(() => {
        const documentElement = document.documentElement;
        return documentElement.scrollWidth - documentElement.clientWidth;
      });

      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
}

test("keyboard focus is visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const focused = page.locator(":focus-visible").first();
  await expect(focused).toBeVisible();

  const outlineStyle = await focused.evaluate(
    (element) => getComputedStyle(element).outlineStyle,
  );
  expect(outlineStyle).not.toBe("none");
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
