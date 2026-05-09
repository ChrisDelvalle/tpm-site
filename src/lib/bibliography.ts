import type {
  ArticleCitation,
  ArticleReferenceBlockContent,
  ArticleReferenceData,
  ParsedBibtexEntry,
} from "./article-references/model";
import {
  type ArticleEntry,
  articleUrl,
  entryTitle,
  formatDate,
} from "./routes";

/** Article plus normalized reference data ready for bibliography aggregation. */
interface BibliographyArticleReferencesInput {
  article: ArticleEntry;
  references: ArticleReferenceData | undefined;
}

/** One article that cited a global bibliography source. */
export interface BibliographySourceArticle {
  articleId: string;
  date: string;
  href: string;
  markerIds: readonly string[];
  publishedAt: Date;
  title: string;
}

/** Display-ready fields derived from structured BibTeX source data. */
interface BibliographyDisplayFields {
  authors?: string | undefined;
  containerTitle?: string | undefined;
  doi?: string | undefined;
  fallbackText: string;
  publisher?: string | undefined;
  sourceUrl?: string | undefined;
  title?: string | undefined;
  year?: string | undefined;
}

/** One global bibliography source entry. */
export interface BibliographyEntry {
  display: BibliographyDisplayFields;
  id: string;
  sourceArticles: readonly BibliographySourceArticle[];
  sourceContent: readonly ArticleReferenceBlockContent[];
  sourceKey: string;
  sourceText: string;
  sourceUrl?: string | undefined;
}

interface BibliographyEntryDraft {
  display: BibliographyDisplayFields;
  sourceArticles: BibliographySourceArticle[];
  sourceContent: readonly ArticleReferenceBlockContent[];
  sourceKey: string;
  sourceText: string;
  sourceUrl?: string | undefined;
}

/**
 * Builds global bibliography entries from parsed article-reference data.
 *
 * @param inputs Articles paired with normalized article-reference data.
 * @returns Deduplicated bibliography entries sorted by source text.
 */
export function bibliographyEntriesFromArticleReferences(
  inputs: readonly BibliographyArticleReferencesInput[],
): BibliographyEntry[] {
  const drafts = inputs.reduce((groups, input) => {
    for (const citation of input.references?.citations ?? []) {
      const sourceKey = bibliographySourceKey(citation.bibtex);
      const previous = groups.get(sourceKey);
      const sourceArticle = sourceArticleFromEntry(input.article, citation);
      const display = bibliographyDisplayFields(citation);
      const next = previous ?? {
        display,
        sourceArticles: [],
        sourceContent: citation.definition.children,
        sourceKey,
        sourceText: display.fallbackText,
        sourceUrl: display.sourceUrl,
      };

      groups.set(sourceKey, {
        ...next,
        sourceArticles: [...next.sourceArticles, sourceArticle],
      });
    }

    return groups;
  }, new Map<string, BibliographyEntryDraft>());

  return Array.from(drafts.values())
    .sort(compareBibliographyDrafts)
    .map((draft) => ({
      ...draft,
      id: `bibliography-${stableSlug(draft.sourceText)}-${stableHash(
        draft.sourceKey,
      )}`,
      sourceArticles: sortedSourceArticles(draft.sourceArticles),
    }));
}

function bibliographySourceKey(entry: ParsedBibtexEntry): string {
  const doi = normalizedField(entry, "doi");
  const url = normalizedField(entry, "url");
  const title = normalizedField(entry, "title");
  const contributor =
    normalizedField(entry, "author") ?? normalizedField(entry, "editor");
  const year = normalizedYear(entry);

  if (doi !== undefined) {
    return `doi:${normalizeDoi(doi)}`;
  }

  if (url !== undefined) {
    return `url:${normalizeUrl(url)}`;
  }

  if (title !== undefined && contributor !== undefined && year !== undefined) {
    return [
      "fingerprint",
      entry.entryType,
      normalizeFingerprintValue(contributor),
      normalizeFingerprintValue(year),
      normalizeFingerprintValue(title),
    ].join(":");
  }

  return [
    "exact",
    entry.entryType,
    entry.normalizedKey,
    ...Object.entries(entry.fields)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${normalizeFingerprintValue(value)}`),
  ].join("\n");
}

function bibliographyDisplayFields(
  citation: ArticleCitation,
): BibliographyDisplayFields {
  const { bibtex } = citation;
  const authors =
    normalizedField(bibtex, "author") ?? normalizedField(bibtex, "editor");
  const containerTitle = normalizedContainerTitle(bibtex);
  const doi = normalizedField(bibtex, "doi");
  const publisher = normalizedField(bibtex, "publisher");
  const sourceUrl = normalizedField(bibtex, "url") ?? doiUrl(doi);
  const title = normalizedField(bibtex, "title");
  const year = normalizedYear(bibtex);

  return {
    ...(authors === undefined ? {} : { authors }),
    ...(containerTitle === undefined ? {} : { containerTitle }),
    ...(doi === undefined ? {} : { doi }),
    fallbackText: citation.definition.children
      .map((block) => block.text)
      .join(" ")
      .trim(),
    ...(publisher === undefined ? {} : { publisher }),
    ...(sourceUrl === undefined ? {} : { sourceUrl }),
    ...(title === undefined ? {} : { title }),
    ...(year === undefined ? {} : { year }),
  };
}

function sourceArticleFromEntry(
  article: ArticleEntry,
  citation: ArticleCitation,
): BibliographySourceArticle {
  return {
    articleId: article.id,
    date: formatDate(article.data.date),
    href: articleUrl(article.id),
    markerIds: citation.references.map((reference) => reference.id),
    publishedAt: article.data.date,
    title: entryTitle(article),
  };
}

function sortedSourceArticles(
  articles: readonly BibliographySourceArticle[],
): BibliographySourceArticle[] {
  return Array.from(
    articles
      .reduce(mergeSourceArticles, new Map<string, BibliographySourceArticle>())
      .values(),
  ).sort(compareSourceArticles);
}

function mergeSourceArticles(
  groups: Map<string, BibliographySourceArticle>,
  article: BibliographySourceArticle,
): Map<string, BibliographySourceArticle> {
  const previous = groups.get(article.href);

  groups.set(
    article.href,
    previous === undefined
      ? article
      : {
          ...previous,
          markerIds: Array.from(
            new Set([...previous.markerIds, ...article.markerIds]),
          ),
        },
  );

  return groups;
}

function compareBibliographyDrafts(
  left: BibliographyEntryDraft,
  right: BibliographyEntryDraft,
): number {
  const authorSort = compareOptionalText(
    left.display.authors,
    right.display.authors,
  );

  if (authorSort !== 0) {
    return authorSort;
  }

  const yearSort = compareOptionalText(left.display.year, right.display.year);

  if (yearSort !== 0) {
    return yearSort;
  }

  const titleSort = compareOptionalText(
    left.display.title,
    right.display.title,
  );

  return titleSort === 0
    ? left.sourceKey.localeCompare(right.sourceKey)
    : titleSort;
}

function compareSourceArticles(
  left: BibliographySourceArticle,
  right: BibliographySourceArticle,
): number {
  const dateSort = right.publishedAt.getTime() - left.publishedAt.getTime();

  return dateSort === 0 ? left.title.localeCompare(right.title) : dateSort;
}

function compareOptionalText(
  left: string | undefined,
  right: string | undefined,
): number {
  if (left === undefined && right === undefined) {
    return 0;
  }

  if (left === undefined) {
    return 1;
  }

  if (right === undefined) {
    return -1;
  }

  return left.localeCompare(right, "en", { numeric: true });
}

function normalizedContainerTitle(
  entry: ParsedBibtexEntry,
): string | undefined {
  return (
    normalizedField(entry, "journal") ??
    normalizedField(entry, "journaltitle") ??
    normalizedField(entry, "booktitle")
  );
}

function normalizedYear(entry: ParsedBibtexEntry): string | undefined {
  return (
    normalizedField(entry, "year") ??
    normalizedField(entry, "date")?.match(/\d{4}/u)?.at(0)
  );
}

function normalizedField(
  entry: ParsedBibtexEntry,
  name: string,
): string | undefined {
  const value = Object.entries(entry.fields).find(([key]) => key === name)?.[1];
  const normalized =
    value === undefined
      ? undefined
      : value.replace(/[{}]/gu, "").replace(/\s+/gu, " ").trim();

  return normalized === "" ? undefined : normalized;
}

function doiUrl(doi: string | undefined): string | undefined {
  return doi === undefined ? undefined : `https://doi.org/${normalizeDoi(doi)}`;
}

function normalizeDoi(value: string): string {
  return value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, "").toLowerCase();
}

function normalizeUrl(value: string): string {
  return value.trim();
}

function normalizeFingerprintValue(value: string): string {
  return value.trim().toLowerCase().replace(/[{}]/gu, "").replace(/\s+/gu, " ");
}

function stableSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/&/gu, "and")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 48);

  return slug === "" ? "source" : slug;
}

function stableHash(value: string): string {
  const hash = Array.from(value).reduce(
    (current, character) =>
      Math.imul(current ^ (character.codePointAt(0) ?? 0), 16_777_619),
    2_166_136_261,
  );

  return (hash >>> 0).toString(36);
}
