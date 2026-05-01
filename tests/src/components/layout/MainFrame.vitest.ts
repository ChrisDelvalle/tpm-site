import { describe, expect, test } from "vitest";

import MainFrame from "../../../../src/components/layout/MainFrame.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "../navigation/navigation-fixture";

describe("MainFrame", () => {
  test("renders the desktop category sidebar and main content slot", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(MainFrame, {
      props: { navigationItems },
      slots: { default: "<h1>Page Content</h1>" },
    });

    expect(view).toContain("Category navigation");
    expect(view).toContain('id="content"');
    expect(view).toContain("<h1>Page Content</h1>");
  });
});
