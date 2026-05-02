import { describe, expect, test } from "vitest";

import BrowsingBody from "../../../../src/components/layout/BrowsingBody.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("BrowsingBody", () => {
  test("renders browsing sections inside the standard page measure", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BrowsingBody, {
      slots: { default: "<section><h1>Archive</h1></section>" },
    });

    expect(view).toContain("data-browsing-body");
    expect(view).toContain("data-page-frame");
    expect(view).toContain("max-w-4xl");
    expect(view).toContain("Archive");
  });
});
