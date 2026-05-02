import { describe, expect, test } from "vitest";

import AuthorProfileHeader from "../../../../src/components/authors/AuthorProfileHeader.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { authorProfileFixture } from "./author-fixture";

describe("AuthorProfileHeader", () => {
  test("renders profile identity, article count, and optional links", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorProfileHeader, {
      props: { profile: authorProfileFixture },
    });

    expect(view).toContain("<h1");
    expect(view).toContain("Seong-Young Her");
    expect(view).toContain("1 article");
    expect(view).toContain("Brief author bio.");
    expect(view).toContain("Website");
  });
});
