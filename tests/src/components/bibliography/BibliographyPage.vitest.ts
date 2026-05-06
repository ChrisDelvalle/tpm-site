import { describe, expect, test } from "vitest";

import BibliographyPage from "../../../../src/components/bibliography/BibliographyPage.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { bibliographyEntryFixture } from "./bibliography-fixture";

describe("BibliographyPage", () => {
  test("renders bibliography entries with a result count", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BibliographyPage, {
      props: { entries: [bibliographyEntryFixture] },
    });

    expect(view).toContain("Bibliography");
    expect(view).toContain("1 source");
    expect(view).toContain("Simulacra and Simulation");
  });

  test("renders the empty state without fake filters", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BibliographyPage, {
      props: { entries: [] },
    });

    expect(view).toContain("0 sources");
    expect(view).toContain("No bibliography entries yet");
    expect(view).not.toContain("BibliographyFilters");
  });
});
