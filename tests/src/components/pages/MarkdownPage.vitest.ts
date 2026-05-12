import { describe, expect, test } from "vitest";

import MarkdownPage from "../../../../src/components/pages/MarkdownPage.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("MarkdownPage", () => {
  test("composes a page header and page prose for Markdown content", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(MarkdownPage, {
      props: {
        description: "Page description.",
        title: "Page Title",
      },
      slots: {
        default: "<p>Rendered Markdown body.</p>",
      },
    });

    expect(view).toContain("<article");
    expect(view).toContain("Page Title");
    expect(view).toContain("Page description.");
    expect(view).toContain("Rendered Markdown body.");
  });
});
