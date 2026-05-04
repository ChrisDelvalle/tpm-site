import { describe, expect, test } from "vitest";

import PrimaryNav from "../../../../src/components/navigation/PrimaryNav.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("PrimaryNav", () => {
  test("renders primary links and marks the current path", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(PrimaryNav, {
      props: { currentPath: "/articles/" },
    });

    expect(view).toContain('aria-label="Primary navigation"');
    expect(view).toContain('href="/articles/"');
    expect(view).toContain('href="/about/"');
    expect(view).not.toContain('href="/categories/"');
    expect(view).toContain('aria-current="page"');
    expect(view).toContain('data-astro-prefetch="hover"');
  });

  test("supports explicit spacing variants for parent-owned header rhythm", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(PrimaryNav, {
      props: {
        gap: "md",
      },
    });

    expect(view).toContain("gap-x-3");
  });
});
