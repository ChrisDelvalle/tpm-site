import { describe, expect, test } from "vitest";

import ArticleMeta from "../../../../src/components/articles/ArticleMeta.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ArticleMeta", () => {
  test("renders author and machine-readable date", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleMeta, {
      props: {
        author: "Seong-Young Her",
        date: new Date("2022-04-06T23:58:10.000Z"),
        formattedDate: "April 6, 2022",
      },
    });

    expect(view).toContain("Seong-Young Her");
    expect(view).toContain('datetime="2022-04-06T23:58:10.000Z"');
    expect(view).toContain("April 6, 2022");
  });
});
