/** PDF fallback behavior for an article MDX component import. */
interface ArticleMdxPdfCompatibility {
  importSource: string;
  mode: "static-link";
  note: string;
}

const compatibleArticleMdxImports = [
  {
    importSource: "../../../components/articles/HoverImageLink.astro",
    mode: "static-link",
    note: "Renders as ordinary inline link text in PDF; hover preview panel is print-hidden.",
  },
  {
    importSource: "../../../components/articles/HoverImageParagraph.astro",
    mode: "static-link",
    note: "Renders as ordinary paragraph text plus inline link in PDF; hover preview panel is print-hidden.",
  },
] as const satisfies readonly ArticleMdxPdfCompatibility[];

/** Supported article MDX component imports and their PDF fallback contracts. */
export const articleMdxPdfCompatibility =
  compatibleArticleMdxImports as readonly ArticleMdxPdfCompatibility[];

/**
 * Reports whether an MDX import can affect PDF rendering.
 *
 * @param importSource Import source string as written in an article MDX file.
 * @returns True when the import points at a reusable component.
 */
export function isArticleMdxComponentImport(importSource: string): boolean {
  return /(?:^|\/)components\//u.test(importSource);
}

/**
 * Checks whether an article MDX import has a declared PDF fallback.
 *
 * Asset imports are not component imports and are therefore compatible here.
 *
 * @param importSource Import source string as written in an article MDX file.
 * @returns True when the import is safe for generated article PDFs.
 */
export function isArticleMdxPdfCompatibleImport(importSource: string): boolean {
  return (
    !isArticleMdxComponentImport(importSource) ||
    articleMdxPdfCompatibility.some(
      (entry) => entry.importSource === importSource,
    )
  );
}
