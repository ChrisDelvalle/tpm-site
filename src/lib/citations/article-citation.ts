import { SITE_TITLE } from "../routes";

/** Author data needed to generate article citations. */
interface ArticleCitationAuthor {
  displayName: string;
  type: "anonymous" | "collective" | "organization" | "person";
}

/** Input metadata for generated citations of TPM articles. */
interface ArticleCitationInput {
  articleId: string;
  authors?: readonly ArticleCitationAuthor[] | undefined;
  canonicalUrl: string;
  legacyAuthor?: string | undefined;
  publishedAt: Date;
  siteTitle?: string | undefined;
  title: string;
}

/** Generated citation text for one supported format. */
interface GeneratedArticleCitation {
  id: "bibtex" | "mla";
  label: "BibTeX" | "MLA";
  text: string;
}

/** Display-ready view model consumed by ArticleCitationMenu. */
export interface ArticleCitationMenuViewModel {
  articleId: string;
  canonicalUrl: string;
  formats: readonly GeneratedArticleCitation[];
  title: string;
}

interface CitationPerson {
  displayName: string;
  type: ArticleCitationAuthor["type"];
}

const terminalPunctuationPattern = /[.?!]"?$/u;
const bibtexSpecialCharacters = new Map([
  ["#", "\\#"],
  ["$", "\\$"],
  ["%", "\\%"],
  ["&", "\\&"],
  ["\\", "\\textbackslash{}"],
  ["_", "\\_"],
  ["{", "\\{"],
  ["}", "\\}"],
]);
const mlaMonths = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
] as const;

/**
 * Builds the view model used by the article citation menu.
 *
 * @param input Article metadata needed for generated citations.
 * @returns Display-ready citation menu model.
 */
export function articleCitationMenuViewModel(
  input: ArticleCitationInput,
): ArticleCitationMenuViewModel {
  return {
    articleId: input.articleId,
    canonicalUrl: input.canonicalUrl,
    formats: generatedArticleCitations(input),
    title: input.title,
  };
}

/**
 * Generates every initially supported citation format for one article.
 *
 * @param input Article metadata needed for generated citations.
 * @returns Generated citation text in deterministic format order.
 */
function generatedArticleCitations(
  input: ArticleCitationInput,
): GeneratedArticleCitation[] {
  return [
    {
      id: "bibtex",
      label: "BibTeX",
      text: articleBibtexCitation(input),
    },
    {
      id: "mla",
      label: "MLA",
      text: articleMlaCitation(input),
    },
  ];
}

/**
 * Generates a BibTeX-compatible citation for a TPM article.
 *
 * @param input Article metadata needed for generated citations.
 * @returns BibTeX citation text.
 */
export function articleBibtexCitation(input: ArticleCitationInput): string {
  const siteTitle = input.siteTitle ?? SITE_TITLE;
  const date = isoDate(input.publishedAt);
  const year = String(input.publishedAt.getUTCFullYear());
  const author = bibtexAuthor(input);
  const fields = [
    field("author", author),
    field("title", input.title),
    field("year", year),
    field("date", date),
    field("organization", siteTitle),
    field("url", input.canonicalUrl),
  ].filter((line) => line !== undefined);

  return [`@online{${bibtexKey(input.articleId)},`, ...fields, "}"].join("\n");
}

/**
 * Generates a concise MLA-style citation for a TPM article.
 *
 * @param input Article metadata needed for generated citations.
 * @returns MLA-style citation text.
 */
export function articleMlaCitation(input: ArticleCitationInput): string {
  const siteTitle = input.siteTitle ?? SITE_TITLE;
  const author = mlaAuthor(input);
  const authorPrefix = author === undefined ? "" : `${author}. `;
  const title = sentenceTitle(input.title);

  return `${authorPrefix}"${title}" ${siteTitle}, ${mlaDate(input.publishedAt)}, ${input.canonicalUrl}.`;
}

function field(name: string, value: string | undefined): string | undefined {
  return value === undefined
    ? undefined
    : `  ${name} = {${bibtexValue(value)}},`;
}

function bibtexAuthor(input: ArticleCitationInput): string | undefined {
  const authors = citationPeople(input);

  return authors.length > 0
    ? authors.map((author) => author.displayName).join(" and ")
    : undefined;
}

function mlaAuthor(input: ArticleCitationInput): string | undefined {
  const authors = citationPeople(input);

  if (authors.length === 0) {
    return undefined;
  }

  if (authors.length > 2) {
    const [firstAuthor] = authors;

    return firstAuthor === undefined
      ? undefined
      : `${mlaAuthorName(firstAuthor)}, et al`;
  }

  return authors.map(mlaAuthorName).join(", and ");
}

function citationPeople(input: ArticleCitationInput): CitationPerson[] {
  if (input.authors !== undefined && input.authors.length > 0) {
    return input.authors
      .map((author) => ({
        displayName: author.displayName.trim(),
        type: author.type,
      }))
      .filter((author) => author.displayName.length > 0);
  }

  const legacy = input.legacyAuthor?.trim();

  return legacy === undefined || legacy.length === 0
    ? []
    : legacy.split(/\s*&\s*/u).map((displayName) => ({
        displayName,
        type: "person",
      }));
}

function mlaAuthorName(author: CitationPerson): string {
  if (author.type !== "person") {
    return author.displayName;
  }

  const parts = author.displayName.split(/\s+/u);
  const last = parts.at(-1);
  const rest = parts.slice(0, -1).join(" ");

  return last === undefined || rest.length === 0
    ? author.displayName
    : `${last}, ${rest}`;
}

function bibtexKey(articleId: string): string {
  const slug = articleId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");

  return slug.length === 0 ? "tpm-article" : `tpm-${slug}`;
}

function bibtexValue(value: string): string {
  return Array.from(
    value,
    (character) => bibtexSpecialCharacters.get(character) ?? character,
  ).join("");
}

function sentenceTitle(title: string): string {
  return terminalPunctuationPattern.test(title) ? title : `${title}.`;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mlaDate(date: Date): string {
  const month = mlaMonths[date.getUTCMonth()] ?? "";

  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}
