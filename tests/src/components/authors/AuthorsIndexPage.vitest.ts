import { describe, expect, test } from "vitest";

import AuthorsIndexPage from "../../../../src/components/authors/AuthorsIndexPage.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { authorProfileFixture } from "./author-fixture";

describe("AuthorsIndexPage", () => {
  test("renders one entry per supplied author profile", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorsIndexPage, {
      props: { profiles: [authorProfileFixture] },
    });

    expect(view).toContain("Authors");
    expect(view).toContain("Seong-Young Her");
    expect(view).toContain("1 article");
    expect(view).toContain('data-astro-prefetch="hover"');
  });

  test("renders a useful empty state", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorsIndexPage, {
      props: { profiles: [] },
    });

    expect(view).toContain("No author profiles are available yet.");
  });
});
