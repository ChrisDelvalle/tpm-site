import { describe, expect, test } from "vitest";

import PageProse from "../../../../src/components/pages/PageProse.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("PageProse", () => {
  test("wraps non-article Markdown output in prose styles", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(PageProse, {
      slots: {
        default: "<p>Rendered page prose.</p>",
      },
    });

    expect(view).toContain("prose");
    expect(view).toContain("Rendered page prose.");
  });
});
