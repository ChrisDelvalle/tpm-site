import { describe, expect, test } from "vitest";

import CatalogPage from "../../../../src/pages/catalog/[...path].astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("catalog page", () => {
  test("renders the catalog page when the route is enabled", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CatalogPage, {
      request: new Request(`${testSiteUrl}/catalog/`),
    });

    expect(view).toContain("TPM Component Catalog");
    expect(view).toContain("https://thephilosophersmeme.com/catalog/");
  });
});
