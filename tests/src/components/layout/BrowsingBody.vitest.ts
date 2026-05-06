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

  test("supports snug top padding for compact first-row navigation", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BrowsingBody, {
      props: { padding: "snug" },
      slots: { default: "<nav>Read</nav>" },
    });

    expect(view).toContain("pt-2");
    expect(view).toContain("lg:pt-3");
    expect(view).not.toContain("py-8");
  });
});
