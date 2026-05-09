import { describe, expect, test } from "vitest";

import BibliographySourceArticles from "../../../../src/components/bibliography/BibliographySourceArticles.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { bibliographyEntryFixture } from "./bibliography-fixture";

describe("BibliographySourceArticles", () => {
  test("renders source article backlinks with dates", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BibliographySourceArticles, {
      props: { articles: bibliographyEntryFixture.sourceArticles },
    });

    expect(view).toContain("Cited by articles");
    expect(view).toContain(
      "/articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/",
    );
    expect(view).toContain("April 6, 2022");
    expect(view).toContain('data-astro-prefetch="hover"');
    expect(view).toContain("data-bibliography-source-articles");
    expect(view).not.toContain('aria-label="Articles citing this source"');
  });

  test("renders nothing without source articles", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BibliographySourceArticles, {
      props: { articles: [] },
    });

    expect(view.trim()).toBe("");
  });
});
