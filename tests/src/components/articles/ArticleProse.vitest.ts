import { describe, expect, test } from "vitest";

import ArticleProse from "../../../../src/components/articles/ArticleProse.astro";
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
    expect(view).toContain("[&#38;>*:first-child]:mt-0");
    expect(view).toContain("Readable article copy.");
  });
});
