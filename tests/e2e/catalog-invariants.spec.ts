import { existsSync } from "node:fs";

import { expect, type Page, test } from "@playwright/test";

import {
  expectHorizontallyContained,
  expectNoHorizontalOverflow,
  viewportMatrix,
} from "./helpers/layout";

const catalogIsBuilt = existsSync("dist/catalog/index.html");

async function setTheme(page: Page, theme: "dark" | "light"): Promise<void> {
  await page.evaluate((nextTheme) => {
    document.documentElement.dataset["theme"] = nextTheme;
    localStorage.setItem("theme", nextTheme);
  }, theme);
}

if (!catalogIsBuilt) {
  test("component catalog route is absent in normal production builds", async ({
    request,
  }) => {
    const response = await request.get("/catalog/");
    expect(response.status()).toBe(404);
  });
} else {
  for (const viewport of viewportMatrix) {
    test(`catalog examples stay contained at ${viewport.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await page.goto("/catalog/");
      await expect(
        page.getByRole("heading", { name: "TPM Component Catalog" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const examples = page.locator("[data-catalog-component]");
      const count = await examples.count();
      expect(count).toBeGreaterThan(20);

      for (let index = 0; index < Math.min(count, 12); index += 1) {
        const example = examples.nth(index);
        const preview = example.locator("[data-catalog-preview]");
        await expectHorizontallyContained(preview, example, {
          inner: "catalog preview",
          outer: "catalog example",
        });
      }

      await setTheme(page, "light");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await expectNoHorizontalOverflow(page);
    });
  }

  test("catalog shows support and danger button states with visible labels", async ({
    page,
  }) => {
    await page.goto("/catalog/");
    const linkButtonExample = page.locator(
      '[data-catalog-component="src/components/ui/LinkButton.astro"]',
    );
    await expect(
      linkButtonExample.getByRole("link", { name: "Support Us" }),
    ).toBeVisible();

    const buttonExample = page.locator(
      '[data-catalog-component="src/components/ui/Button.astro"]',
    );
    await expect(
      buttonExample.getByRole("button", { name: "Danger" }),
    ).toBeVisible();

    await setTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(
      linkButtonExample.getByRole("link", { name: "Support Us" }),
    ).toBeVisible();
    await expect(
      buttonExample.getByRole("button", { name: "Danger" }),
    ).toBeVisible();
  });
}
