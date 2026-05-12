import { describe, expect, test } from "vitest";

import AuthorByline from "../../../../src/components/authors/AuthorByline.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { authorSummaryFixture } from "./author-fixture";

describe("AuthorByline", () => {
  test("renders structured authors in supplied order", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorByline, {
      props: {
        authors: [
          authorSummaryFixture,
          {
            displayName: "Masha Zharova",
            href: "/authors/masha-zharova/",
            id: "masha-zharova",
            type: "person",
          },
        ],
      },
    });

    expect(view).toContain("data-author-byline");
    expect(view.indexOf("Seong-Young Her")).toBeLessThan(
      view.indexOf("Masha Zharova"),
    );
    expect(view).toContain("&");
  });

  test("falls back to legacy author text when structured authors are absent", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorByline, {
      props: { legacyAuthor: "Legacy Author" },
    });

    expect(view).toContain("Legacy Author");
    expect(view).not.toContain("<a ");
  });
});
