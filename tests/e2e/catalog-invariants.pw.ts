import { existsSync } from "node:fs";

import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import {
  expectFocusVisible,
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

  test("catalog article references keep markers and backlinks keyboard navigable", async ({
    page,
  }) => {
    await page.goto("/catalog/");

    const example = page.locator(
      '[data-catalog-component="src/components/articles/ArticleReferences.astro"]',
    );
    const marker = example.locator("#cite-ref-baudrillard-1981");
    const entry = example.locator("#cite-baudrillard-1981");
    const backlink = example.locator("#cite-backref-baudrillard-1981");

    await expect(marker).toBeVisible();
    await expect(entry).toBeVisible();
    await expect(backlink).toBeVisible();

    await marker.focus();
    await expectFocusVisible(page);
    await marker.click();
    await expect(page).toHaveURL(/#cite-baudrillard-1981$/u);

    await backlink.focus();
    await expectFocusVisible(page);
    await backlink.click();
    await expect(page).toHaveURL(/#cite-ref-baudrillard-1981$/u);
  });

  test("catalog article references have sensible accessibility structure", async ({
    page,
  }) => {
    await page.goto("/catalog/");

    const exampleSelector =
      '[data-catalog-component="src/components/articles/ArticleReferences.astro"]';
    const example = page.locator(exampleSelector);

    await expect(example.getByRole("heading", { name: "Notes" })).toBeVisible();
    await expect(
      example.getByRole("heading", { name: "Bibliography" }),
    ).toBeVisible();
    await expect(
      example.getByRole("navigation", {
        name: "Backlinks for citation references",
      }),
    ).toBeVisible();
    await expect(example.locator("main")).toHaveCount(0);

    const duplicateIds = await example.evaluate((element) => {
      const seen = new Set<string>();
      const duplicates = new Set<string>();

      for (const elementWithId of element.querySelectorAll("[id]")) {
        const id = elementWithId.id;

        if (seen.has(id)) {
          duplicates.add(id);
        }

        seen.add(id);
      }

      return Array.from(duplicates);
    });

    expect(duplicateIds).toEqual([]);

    const results = await new AxeBuilder({ page })
      .include(exampleSelector)
      .analyze();
    const severeViolations = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    expect(severeViolations).toEqual([]);

    await setTheme(page, "light");
    await expect(example.locator("#cite-ref-baudrillard-1981")).toBeVisible();
    await expect(
      example.locator("#cite-backref-baudrillard-1981"),
    ).toBeVisible();
  });

  for (const viewport of viewportMatrix) {
    test(`catalog article references stay contained at ${viewport.label}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await page.goto("/catalog/");

      const example = page.locator(
        '[data-catalog-component="src/components/articles/ArticleReferences.astro"]',
      );
      const references = example.locator("[data-article-references]");

      await expect(references).toBeVisible();
      await expectHorizontallyContained(references, example, {
        inner: "article references",
        outer: "article references catalog example",
      });
      await expectNoHorizontalOverflow(page);
    });
  }
}
