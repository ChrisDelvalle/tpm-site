import { describe, expect, test } from "vitest";

import TableOfContentsItem from "../../../../src/components/articles/TableOfContentsItem.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("TableOfContentsItem", () => {
  test("renders one normalized heading link with level and order anchors", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(TableOfContentsItem, {
      props: {
        heading: {
          depth: 3,
          href: "#nested-heading",
          id: "nested-heading",
          level: 2,
          order: 1,
          text: "Nested Heading",
        },
      },
    });

    expect(view).toContain('href="#nested-heading"');
    expect(view).toContain('data-toc-heading-level="2"');
    expect(view).toContain('data-toc-heading-order="1"');
    expect(view).toContain("Nested Heading");
  });

  test("marks the current item without changing the link target", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(TableOfContentsItem, {
      props: {
        current: true,
        heading: {
          depth: 2,
          href: "#current-heading",
          id: "current-heading",
          level: 1,
          order: 0,
          text: "Current Heading",
        },
      },
    });

    expect(view).toContain('aria-current="location"');
    expect(view).toContain('href="#current-heading"');
  });
});
