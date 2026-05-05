import { describe, expect, test } from "vitest";

import BibliographyRoute from "../../../src/pages/bibliography.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("bibliography route", () => {
  test("renders the global bibliography browsing page", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BibliographyRoute, {
      request: new Request(`${testSiteUrl}/bibliography/`),
    });

    expect(view).toContain("Bibliography | The Philosopher");
    expect(view).toContain("Bibliography");
    expect(view).toContain("Sources cited by articles");
    expect(view).toContain(
      'href="https://thephilosophersmeme.com/bibliography/"',
    );
  });
});
