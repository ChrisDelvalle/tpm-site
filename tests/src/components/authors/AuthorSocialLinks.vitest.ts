import { describe, expect, test } from "vitest";

import AuthorSocialLinks from "../../../../src/components/authors/AuthorSocialLinks.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("AuthorSocialLinks", () => {
  test("renders nothing for empty link arrays", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorSocialLinks, {
      props: { links: [] },
    });

    expect(view.trim()).toBe("");
  });

  test("renders visible profile link labels", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorSocialLinks, {
      props: {
        links: [{ href: "https://example.com", label: "Website" }],
      },
    });

    expect(view).toContain("Author links");
    expect(view).toContain("Website");
    expect(view).toContain("https://example.com");
    expect(view).not.toContain("data-astro-prefetch");
  });
});
