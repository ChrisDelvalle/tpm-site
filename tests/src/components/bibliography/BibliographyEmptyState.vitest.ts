import { describe, expect, test } from "vitest";

import BibliographyEmptyState from "../../../../src/components/bibliography/BibliographyEmptyState.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("BibliographyEmptyState", () => {
  test("explains why no sources are listed yet", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BibliographyEmptyState, {
      props: { auditHref: "/articles/all/" },
    });

    expect(view).toContain("No bibliography entries yet");
    expect(view).toContain("canonical BibTeX-backed citations");
    expect(view).toContain("/articles/all/");
  });
});
