import { describe, expect, test } from "vitest";

import AuthorLink from "../../../../src/components/authors/AuthorLink.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { authorSummaryFixture } from "./author-fixture";

describe("AuthorLink", () => {
  test("renders a link to the author profile", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorLink, {
      props: { author: authorSummaryFixture },
    });

    expect(view).toContain('href="/authors/seong-young-her/"');
    expect(view).toContain("Seong-Young Her");
  });
});
