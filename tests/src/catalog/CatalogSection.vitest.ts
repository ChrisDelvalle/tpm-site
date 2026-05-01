import { describe, expect, test } from "vitest";

import CatalogSection from "../../../src/catalog/CatalogSection.astro";
import { createAstroTestContainer } from "../../helpers/astro-container";

describe("CatalogSection", () => {
  test("groups catalog examples under a titled section", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CatalogSection, {
      props: {
        description: "Shared primitives.",
        title: "UI Primitives",
      },
      slots: {
        default: "<article>Example</article>",
      },
    });

    expect(view).toContain("UI Primitives");
    expect(view).toContain("Shared primitives.");
    expect(view).toContain("Example");
  });
});
