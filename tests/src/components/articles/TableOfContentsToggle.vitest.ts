import { describe, expect, test } from "vitest";

import TableOfContentsToggle from "../../../../src/components/articles/TableOfContentsToggle.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("TableOfContentsToggle", () => {
  test("renders a compact native summary control with explicit state labels", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(TableOfContentsToggle, {
      props: { label: "Essay contents" },
    });

    expect(view).toContain("<summary");
    expect(view).toContain('aria-label="Essay contents"');
    expect(view).not.toContain(">Essay contents<");
    expect(view).toContain("Hide");
    expect(view).toContain("Show Contents");
  });
});
