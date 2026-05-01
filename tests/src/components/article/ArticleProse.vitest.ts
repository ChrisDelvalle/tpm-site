import { describe, expect, test } from "vitest";

import ArticleProse from "../../../../src/components/article/ArticleProse.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ArticleProse", () => {
  test("renders slotted article content inside the prose wrapper", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleProse, {
      slots: {
        default: "<p>Readable article copy.</p>",
      },
    });

    expect(view).toContain("prose");
    expect(view).toContain("Readable article copy.");
  });
});
