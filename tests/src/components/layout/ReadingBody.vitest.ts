import { describe, expect, test } from "vitest";

import ReadingBody from "../../../../src/components/layout/ReadingBody.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ReadingBody", () => {
  test("wraps reading content in the shared margin layout", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ReadingBody, {
      slots: { default: "<article>Article body</article>" },
    });

    expect(view).toContain("data-reading-body");
    expect(view).toContain("data-margin-sidebar-layout");
    expect(view).toContain("Article body");
  });

  test("renders the optional table-of-contents slot in the left rail", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ReadingBody, {
      slots: {
        default: "<article>Article body</article>",
        toc: "<nav>Contents</nav>",
      },
    });

    expect(view).toContain("data-margin-sidebar-left");
    expect(view).toContain("Contents");
  });
});
