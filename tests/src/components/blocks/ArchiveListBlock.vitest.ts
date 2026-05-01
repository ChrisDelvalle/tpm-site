import { describe, expect, test } from "vitest";

import ArchiveListBlock from "../../../../src/components/blocks/ArchiveListBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleItems } from "../articles/article-fixture";

describe("ArchiveListBlock", () => {
  test("renders a page heading and article list", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArchiveListBlock, {
      props: {
        description: "Essays and notes.",
        items: articleItems,
        pagefindIgnore: true,
        title: "Articles",
      },
    });

    expect(view).toContain("Articles");
    expect(view).toContain("Essays and notes.");
    expect(view).toContain("data-pagefind-ignore");
    expect(view).toContain("Article Title");
  });

  test("renders optional eyebrow text", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArchiveListBlock, {
      props: {
        eyebrow: "Category",
        items: articleItems,
        title: "History",
      },
    });

    expect(view).toContain("Category");
    expect(view).toContain("History");
  });
});
