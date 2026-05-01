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
    expect(view).toContain('aria-current="page"');
  });
});
