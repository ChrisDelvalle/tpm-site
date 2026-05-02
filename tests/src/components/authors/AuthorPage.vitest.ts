import { describe, expect, test } from "vitest";

import AuthorPage from "../../../../src/components/authors/AuthorPage.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleItems } from "../articles/article-fixture";
import { authorProfileFixture } from "./author-fixture";

describe("AuthorPage", () => {
  test("composes profile header, optional bio, and article list", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorPage, {
      props: {
        hasProfileBody: true,
        items: articleItems,
        profile: authorProfileFixture,
      },
      slots: {
        default: "<p>Long profile body.</p>",
      },
    });

    expect(view).toContain("data-author-page");
    expect(view).toContain("Seong-Young Her");
    expect(view).toContain("Long profile body.");
    expect(view).toContain("Articles by Seong-Young Her");
  });
});
