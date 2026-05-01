import { describe, expect, test } from "vitest";

import ThemeToggle from "../../../../src/components/navigation/ThemeToggle.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ThemeToggle", () => {
  test("renders the theme-controller hook with an accessible label", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ThemeToggle);

    expect(view).toContain("theme-toggle");
    expect(view).toContain('type="button"');
    expect(view).toContain('aria-label="Toggle dark mode"');
  });
});
