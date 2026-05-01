import { describe, expect, test } from "vitest";

import CatalogExample from "../../../src/catalog/CatalogExample.astro";
import { createAstroTestContainer } from "../../helpers/astro-container";

describe("CatalogExample", () => {
  test("renders catalog example metadata and slotted preview", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CatalogExample, {
      props: {
        componentPath: "src/components/ui/Button.astro",
        description: "Button example.",
        title: "Button",
      },
      slots: {
        default: "<button>Preview</button>",
      },
    });

    expect(view).toContain("Button example.");
    expect(view).toContain("src/components/ui/Button.astro");
    expect(view).toContain("Preview");
  });
});
