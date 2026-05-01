import { describe, expect, test } from "vitest";

import CategoriesIndexPage from "../../../../src/pages/categories/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("categories index page", () => {
  test("renders category cards from content metadata", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoriesIndexPage, {
      request: new Request(`${testSiteUrl}/categories/`),
    });

    expect(view).toContain("Browse the archive by subject.");
    expect(view).toContain("category-card");
  });
});
