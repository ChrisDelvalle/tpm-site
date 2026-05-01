import { describe, expect, test } from "vitest";

import ComponentCatalog from "../../../src/catalog/ComponentCatalog.astro";
import { createAstroTestContainer } from "../../helpers/astro-container";

describe("ComponentCatalog", () => {
  test("renders the private catalog overview and primitive examples", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ComponentCatalog);

    expect(view).toContain("TPM Component Catalog");
    expect(view).toContain("UI Primitives");
    expect(view).toContain("src/components/ui/Button.astro");
    expect(view).toContain("Media Primitives");
    expect(view).toContain("Article Components");
    expect(view).toContain("Homepage Blocks");
    expect(view).toContain("Archive, Category, And Search Blocks");
    expect(view).toContain("Page Components");
    expect(view).toContain("Navigation Components");
    expect(view).toContain("Layout Components");
  });
});
