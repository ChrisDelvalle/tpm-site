import { describe, expect, test } from "vitest";

import SearchForm from "../../../../src/components/navigation/SearchForm.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SearchForm", () => {
  test("renders semantic search with a labeled native input", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SearchForm, {
      props: {
        inputId: "search-test",
        label: "Search articles",
      },
    });

    expect(view).toContain('role="search"');
    expect(view).toContain('for="search-test"');
    expect(view).toContain('type="search"');
    expect(view).toContain('name="q"');
  });
});
