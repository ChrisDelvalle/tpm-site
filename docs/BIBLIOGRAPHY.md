# Bibliography Technical Design

## Purpose

This document defines how The Philosopher's Meme should normalize citations and
build a global bibliography page without making article authors or UI
components manage fragile citation logic.

It builds on `docs/remark-plugins/article-references.md`. Article-local
citations use canonical `cite-*` footnotes. The global bibliography page is a
reader-facing browsing page built from those normalized citations.

## Design Decision

Use explicit Markdown footnotes as the only canonical bibliography source.

Canonical citation:

```md
Claim.[^cite-baudrillard-1981]

[^cite-baudrillard-1981]: [@Baudrillard 1981] Baudrillard, Jean. _Simulacra and Simulation_. 1981.
```

Rules:

- `cite-*` labels are bibliography citations.
- `note-*` labels are explanatory notes.
- Optional `[@Display Label]` metadata controls inline citation display.
- Ordinary inline links are not bibliography entries.
- Legacy references sections can be migrated, but they do not define the future
  model.

This keeps authoring simple and parseable: authors write ordinary GFM footnotes
with explicit labels, and the build produces article-local bibliography
sections plus a global bibliography page.

## Corpus Survey

The current corpus has 61 article files. A scan found these citation-like
patterns.

### Explicit Reference Or Bibliography Sections

These files contain headings such as `Reference`, `References`, or
`Bibliography`:

- `src/content/articles/aesthetics/we-can-have-retrieval-inference-synthesis.md`
- `src/content/articles/game-studies/gamergate-as-metagaming.md`
- `src/content/articles/metamemetics/internetmemetics.md`
- `src/content/articles/metamemetics/the-memeticists-challenge-remains-open.md`
- `src/content/articles/metamemetics/what-is-a-meme.md`
- `src/content/articles/philosophy/how-to-digitally-coauthor-articles-in-philosophy-class.md`
- `src/content/articles/philosophy/postnaturalism.md`

Migration approach: convert true source entries into `cite-*` definitions and
preserve explanatory prose as normal article text or `note-*` footnotes.

### Markdown Footnotes

These files contain Markdown footnote syntax:

- `src/content/articles/metamemetics/what-is-a-meme.md`
- `src/content/articles/philosophy/postnaturalism.md`

`postnaturalism.md` uses footnotes heavily as source references and is the
largest normalization case. `what-is-a-meme.md` mixes explanatory notes and
bibliography-like notes. Both need careful manual review before release-blocking
validation is enabled.

### Bracket-Style Numbered Citations

These files contain bracket-style numeric citations such as escaped `[9]` or
plain `[1]`:

- `src/content/articles/aesthetics/memes-jokes-and-visual-puns.md`
- `src/content/articles/irony/defining-normie-casual-ironist-and-autist-in-internet-subcultures.md`

Migration approach: if the bracket number points to a real source entry, convert
it to a canonical `cite-*` reference. If it is ordinary prose or notation,
leave it unchanged.

### Raw HTML Or MDX Link-Like Markup

These files contain raw HTML/MDX link-like or citation-adjacent markup:

- `src/content/articles/metamemetics/glossary-1-dot-0.md`
- `src/content/articles/metamemetics/what-is-a-meme.md`
- `src/content/articles/philosophy/an-internet-koan.md`
- `src/content/articles/politics/social-media-freedom.mdx`

Migration approach: do not infer bibliography entries from raw HTML. Convert
only if a manual review confirms the markup is a source citation.

### Ordinary Inline Links

Many articles contain ordinary inline links. They are often context links,
archive links, media links, platform links, or prose references rather than
bibliographic sources.

Files with inline URLs include:

- `src/content/articles/aesthetics/gondola-shrine.md`
- `src/content/articles/aesthetics/kandinsky-and-loss.md`
- `src/content/articles/aesthetics/memes-jokes-and-visual-puns.md`
- `src/content/articles/aesthetics/platform-content-design.md`
- `src/content/articles/aesthetics/structure-and-content-in-drake-style-templates.md`
- `src/content/articles/game-studies/memes-are-not-jokes-they-are-diagram-games.md`
- `src/content/articles/game-studies/the-memetic-bottleneck.md`
- `src/content/articles/game-studies/twitch-plays-pokemon.mdx`
- `src/content/articles/game-studies/undertale-review.md`
- `src/content/articles/history/2010-decade-review-part-1.md`
- `src/content/articles/history/2010-decade-review-part-2.md`
- `src/content/articles/history/concept-jjalbang.md`
- `src/content/articles/history/death-of-a-meme-or-how-leo-learned-to-stop-worrying-and-love-the-bear.md`
- `src/content/articles/history/kym-magibon.md`
- `src/content/articles/history/long-boys-never-grow-up.md`
- `src/content/articles/history/misattributed-plato-quote-is-real-now.md`
- `src/content/articles/history/the-meta-ironic-era.md`
- `src/content/articles/history/what-we-talk-about-harambe.md`
- `src/content/articles/history/wittgensteins-most-beloved-quote-was-real-but-its-fake-now.md`
- `src/content/articles/irony/bane-loss-and-phylogeny.md`
- `src/content/articles/irony/defining-normie-casual-ironist-and-autist-in-internet-subcultures.md`
- `src/content/articles/irony/post-irony-against-meta-irony.md`
- `src/content/articles/irony/the-ironic-normie.md`
- `src/content/articles/irony/the-revised-quadrant-model.md`
- `src/content/articles/irony/when-you-drink-water.md`
- `src/content/articles/memeculture/a-short-note-on-the-death-of-pepe.md`
- `src/content/articles/memeculture/all-memes-are-from-the-future.md`
- `src/content/articles/memeculture/early-trash-dove.md`
- `src/content/articles/memeculture/gme-frenzy-hints-at-the-new-stage-of-memecultures.md`
- `src/content/articles/memeculture/homesteading-the-memeosphere.md`
- `src/content/articles/memeculture/moe-to-memes-otaku-to-autist.md`
- `src/content/articles/metamemetics/internetmemetics.md`
- `src/content/articles/metamemetics/the-memeticists-challenge-remains-open.md`
- `src/content/articles/metamemetics/vulliamy-response.md`
- `src/content/articles/metamemetics/what-is-a-meme.md`
- `src/content/articles/philosophy/a-school-of-internet-philosophy.md`
- `src/content/articles/philosophy/an-internet-koan.md`
- `src/content/articles/philosophy/how-to-digitally-coauthor-articles-in-philosophy-class.md`
- `src/content/articles/philosophy/postnaturalism.md`
- `src/content/articles/politics/a-tale-of-two-healthcare-narratives.md`
- `src/content/articles/politics/joshua-citarella-astroturfing.md`
- `src/content/articles/politics/on-vectoralism-and-the-meme-alliance.mdx`
- `src/content/articles/politics/president-parks-corruption-cult.md`
- `src/content/articles/politics/social-media-freedom.mdx`
- `src/content/articles/politics/the-structure-of-hyperspatial-politics.md`

Migration approach: inline links stay inline unless a human explicitly converts
one to a canonical citation. The parser must never assume every inline link is a
source.

## Canonical Data Model

Global bibliography data should be derived from normalized article citation
data:

```ts
interface BibliographyEntry {
  id: string;
  label: string;
  displayLabel: string | undefined;
  content: ArticleReferenceDefinitionContent;
  sourceArticles: readonly BibliographySourceArticle[];
}

interface BibliographySourceArticle {
  articleId: string;
  title: string;
  href: string;
  category: string;
  publishedAt: Date;
  markerIds: readonly string[];
}
```

This model intentionally does not require structured author/title/year fields.
Those may be added later through explicit source IDs or structured source
metadata, but the first dependable source is rich citation definition content.

## Parsing Boundary

Parsing belongs to the article references plugin and its pure helpers:

- Markdown/MDX source becomes GFM footnote AST nodes.
- `note-*` and `cite-*` labels become normalized reference data.
- Article rendering consumes normalized notes and citations.
- Global bibliography aggregation consumes normalized citations.

No route, visual component, or bibliography page component should parse article
Markdown directly.

## Legacy Migration Rules

Legacy migration is article-content work and requires explicit instruction.

Rules:

- Preserve author wording and intent.
- Convert true source entries to `cite-*` definitions.
- Convert explanatory notes to `note-*` definitions.
- Leave ordinary inline links alone.
- Leave ambiguous links alone until reviewed.
- Do not fuzzy-deduplicate sources.
- Do not invent author/year metadata from prose.
- Keep one article/reference format change reviewable at a time.

## Validation And Enforcement

Before corpus normalization is complete:

- plugin fixtures should be strict;
- published article validation may use explicit exceptions;
- review checks may warn about legacy reference sections.

After normalization:

- invalid footnote labels fail for published articles;
- missing definitions fail;
- unreferenced definitions fail;
- duplicate definitions fail;
- repeated `note-*` references fail;
- repeated `cite-*` references pass;
- malformed leading `[@...]` display labels fail.

Author-facing messages must explain what to change, for example:

```text
Invalid article reference label "[^source-1]". Use "[^note-...]" for explanatory notes or "[^cite-...]" for bibliography citations.
```

## Global Bibliography Page

The global bibliography page is a browsing page:

```text
BrowsingBody
  PageHeader
  optional intro
  BibliographyList
    BibliographyEntry
      BibliographySourceArticles
  optional BibliographyFilters
  SupportBlock or footer handoff
```

Reader goals:

- scan all cited sources;
- see which article used a source;
- navigate from a source to the article that cited it;
- search or filter if the list becomes large.

The first implementation should support deterministic sorting and article
back-links before adding complex filters.

## SEO And Machine-Readable Data

The bibliography page should have:

- canonical URL;
- sitemap inclusion;
- Pagefind indexing unless the implementation chooses otherwise;
- normal Open Graph/Twitter metadata;
- optional JSON-LD only if it can be generated accurately from structured data.

Do not emit fake structured source metadata if the project only has rich prose
citation definitions.

## Tests

Technical tests:

- parser fixtures for every legacy and canonical citation pattern;
- global aggregation from multiple articles;
- repeated citations in one article;
- same citation label in different articles;
- missing/invalid source article metadata;
- no citations;
- long citation definitions;
- non-URL sources.

Component and browser tests:

- bibliography list renders no horizontal overflow;
- every entry links back to source articles;
- empty state is useful;
- long URLs wrap;
- filter/search controls remain associated with result regions if present;
- page uses browsing width and footer navigation;
- light/dark focus and link states remain readable.

## Open Risks

- Some inline links may be editorially important sources but ambiguous to
  tooling.
- Some external links may be dead before migration.
- Existing references sections may mix notes, sources, and editorial asides.
- Rich citation definitions may be hard to pass through Astro metadata; the
  article references plugin design contains a fallback.
- Global deduplication is tempting but dangerous without explicit canonical
  source IDs.

## Implementation Milestones

The checklist breaks implementation into:

- article reference data path proof;
- pure reference model and normalization;
- remark plugin;
- article-local rendering components;
- article integration and gates;
- corpus normalization;
- global bibliography page implementation.
