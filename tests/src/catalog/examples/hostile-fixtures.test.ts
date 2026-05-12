import { describe, expect, test } from "bun:test";

import {
  catalogArticleItems,
  catalogNavigationItems,
  catalogTags,
  longUnbrokenWord,
} from "../../../../src/catalog/examples/hostile-fixtures";

describe("catalog hostile fixtures", () => {
  test("include long text, dense tags, current navigation, and one-item lists", () => {
    expect(longUnbrokenWord.length).toBeGreaterThan(40);
    expect(catalogTags).toContain(longUnbrokenWord);
    expect(catalogTags.length).toBeGreaterThanOrEqual(6);
    expect(
      catalogArticleItems.some((item) => item.title.includes(longUnbrokenWord)),
    ).toBe(true);
    expect(
      catalogNavigationItems.some((item) =>
        item.articles.some((article) => article.isCurrent),
      ),
    ).toBe(true);
    expect(
      catalogNavigationItems.some((item) => item.articles.length === 1),
    ).toBe(true);
  });
});
