import { describe, expect, test } from "vitest";

import SearchReveal from "../../../../src/components/navigation/SearchReveal.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SearchReveal", () => {
  test("renders a popover search disclosure with an accessible trigger", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SearchReveal, {
      props: { popoverId: "search-reveal-test" },
    });

    expect(view).toContain('aria-label="Open search"');
    expect(view).toContain('popovertarget="search-reveal-test"');
    expect(view).toContain('popover="auto"');
    expect(view).toContain("data-search-reveal-trigger");
    expect(view).toContain("data-search-reveal-panel");
    expect(view).toContain("Site search");
  });
});
