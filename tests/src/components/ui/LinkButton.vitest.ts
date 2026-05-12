import { describe, expect, test } from "vitest";

import LinkButton from "../../../../src/components/ui/LinkButton.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("LinkButton", () => {
  test("renders call-to-action links with safe external rel defaults", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(LinkButton, {
      props: {
        href: "https://example.com/support",
        target: "_blank",
      },
      slots: {
        default: "Support Us",
      },
    });

    expect(view).toContain('href="https://example.com/support"');
    expect(view).toContain('rel="noreferrer"');
    expect(view).not.toContain("data-astro-prefetch");
    expect(view).toContain("Support Us");
  });

  test("supports opt-in prefetch for internal button-style links", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(LinkButton, {
      props: {
        href: "/articles/",
        prefetch: "hover",
      },
      slots: {
        default: "Articles",
      },
    });

    expect(view).toContain('data-astro-prefetch="hover"');
  });
});
