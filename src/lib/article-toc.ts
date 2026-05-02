const minimumTableOfContentsHeadings = 2;

/** Raw heading metadata returned by Astro's `render(entry)` helper. */
interface RenderedArticleHeading {
  depth: number;
  slug: string;
  text: string;
}

/** Display-ready article heading link for the article table of contents. */
export interface ArticleTableOfContentsHeading {
  depth: number;
  href: `#${string}`;
  id: string;
  level: number;
  order: number;
  text: string;
}

const includedHeadingDepths = new Set([2, 3]);

/**
 * Converts Astro-rendered heading metadata into table-of-contents data.
 *
 * @param headings Heading metadata returned by `render(entry)`.
 * @returns Display-ready article-local heading navigation data.
 */
export function articleTableOfContentsHeadings(
  headings: readonly RenderedArticleHeading[],
): ArticleTableOfContentsHeading[] {
  const includedHeadings = headings.filter((heading) =>
    includedHeadingDepths.has(heading.depth),
  );
  const minimumDepth = includedHeadings.reduce(
    (currentMinimum, heading) => Math.min(currentMinimum, heading.depth),
    Number.POSITIVE_INFINITY,
  );

  return includedHeadings.map((heading, index) => ({
    depth: heading.depth,
    href: `#${heading.slug}`,
    id: heading.slug,
    level:
      minimumDepth === Number.POSITIVE_INFINITY
        ? 1
        : heading.depth - minimumDepth + 1,
    order: index,
    text: heading.text,
  }));
}

/**
 * Determines whether the table of contents would help enough to render.
 *
 * @param headings Normalized article table-of-contents headings.
 * @returns Whether the article should show table-of-contents navigation.
 */
export function hasUsefulTableOfContents(
  headings: readonly ArticleTableOfContentsHeading[],
): boolean {
  return headings.length >= minimumTableOfContentsHeadings;
}
