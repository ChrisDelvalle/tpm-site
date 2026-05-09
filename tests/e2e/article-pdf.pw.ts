import { expect, test } from "@playwright/test";

test.describe("article PDF invariants", () => {
  test("article pages expose Scholar metadata and same-directory PDFs", async ({
    page,
  }) => {
    await page.goto("/articles/what-is-a-meme/");

    const pdfLink = page.locator("[data-article-pdf-link]");
    await expect(pdfLink).toBeVisible();
    await expect(pdfLink).toHaveAccessibleName("Save PDF");
    await expect(pdfLink).toHaveText(/PDF/u);

    const pdfHref = "/articles/what-is-a-meme/what-is-a-meme.pdf";
    await expect(pdfLink).toHaveAttribute("href", pdfHref);
    await expect(page.locator('meta[name="citation_title"]')).toHaveAttribute(
      "content",
      "What Is A Meme?",
    );
    await expect(
      page.locator('meta[name="citation_author"]').first(),
    ).toHaveAttribute("content", /Claudia Vulliamy/u);
    await expect(page.locator('meta[name="citation_pdf_url"]')).toHaveAttribute(
      "content",
      /\/articles\/what-is-a-meme\/what-is-a-meme\.pdf$/u,
    );

    const pdfResponse = await page.request.get(pdfHref);
    expect(pdfResponse.ok()).toBe(true);
    expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
    expect(
      Buffer.from(await pdfResponse.body())
        .subarray(0, 5)
        .toString(),
    ).toBe("%PDF-");
  });

  test("print rendering keeps scholarly article content and strips web-only UI", async ({
    page,
  }) => {
    await page.goto("/articles/what-is-a-meme/");
    await page.emulateMedia({ media: "print" });

    await expect(page.locator("[data-site-header]")).toBeHidden();
    await expect(page.locator("[data-article-pdf-link]")).toBeHidden();
    await expect(
      page.locator('[data-article-toc-placement="rail"]'),
    ).toBeHidden();
    await expect(
      page.locator('[data-article-toc-placement="inline"]'),
    ).toBeVisible();
    await expect(
      page.locator("#article-references-bibliography-heading"),
    ).toBeVisible();
    await expect(page.locator("[data-article-references]")).toBeVisible();
  });

  test("print fallbacks preserve MDX hover links and embedded media", async ({
    page,
  }) => {
    await page.emulateMedia({ media: "print" });
    await page.goto("/articles/social-media-freedom/");

    await expect(
      page.locator("[data-hover-image-trigger]").first(),
    ).toBeVisible();
    await expect(page.locator("[data-hover-image-panel]").first()).toBeHidden();

    await page.goto("/articles/gondola-shrine/");
    await expect(
      page.locator("[data-article-embed-frame]").first(),
    ).toBeHidden();
    await expect(
      page.locator("[data-article-embed-fallback]").first(),
    ).toBeVisible();
  });
});
