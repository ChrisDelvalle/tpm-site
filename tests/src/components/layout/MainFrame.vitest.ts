import { describe, expect, test } from "vitest";

import MainFrame from "../../../../src/components/layout/MainFrame.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
describe("MainFrame", () => {
  test("renders a single main landmark around the page-body slot", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(MainFrame, {
      slots: { default: "<h1>Page Content</h1>" },
    });

    expect(view).toContain('id="content"');
    expect(view).toContain("<h1>Page Content</h1>");
    expect(view).not.toContain("Category navigation");
  });
});
