import { describe, expect, test } from "vitest";

import TableOfContentsToggle from "../../../../src/components/articles/TableOfContentsToggle.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("TableOfContentsToggle", () => {
  test("renders a visible native summary control with a custom label", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(TableOfContentsToggle, {
      props: { label: "Essay contents" },
    });

    expect(view).toContain("<summary");
    expect(view).toContain("Essay contents");
    expect(view).toContain("Hide");
  });
});
