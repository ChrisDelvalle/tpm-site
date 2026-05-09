import { describe, expect, test } from "vitest";

import TextLink from "../../../../src/components/ui/TextLink.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("TextLink", () => {
  test("renders shared inline link focus and hover styling", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(TextLink, {
      props: {
        href: "/articles/",
        variant: "nav",
      },
      slots: {
        default: "Articles",
      },
    });

    expect(view).toContain('href="/articles/"');
    expect(view).toContain("focus-visible:outline-ring");
    expect(view).toContain("Articles");
  });

  test("renders explicit Astro prefetch hints only when requested", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(TextLink, {
      props: {
        href: "/articles/",
        prefetch: "tap",
      },
      slots: {
        default: "Articles",
      },
    });

    expect(view).toContain('data-astro-prefetch="tap"');
  });
});
