# Article Reference Migration Decisions

This report records migration decisions for article-reference cleanup. It is the
human decision layer that sits beside the generated
[`ARTICLE_REFERENCE_CONTENT_MIGRATION.md`](./ARTICLE_REFERENCE_CONTENT_MIGRATION.md)
catalog.

Every future catalog update that changes migration rules, article
classification, exception handling, or content-normalization scope should add or
update a decision record here. The catalog says what the tooling detected; this
report says what we decided to do about it and why.

## Decision Template

Use this shape for future decisions:

```md
### ARD-000: Short Decision Title

- Date: YYYY-MM-DD
- Status: Proposed | Accepted | Superseded
- Applies to: article paths, pattern names, or tooling
- Decision: one concise sentence
- Reasoning: why this is the right interpretation or migration boundary
- Consequences: what changes, what remains unresolved, and what reviewers
  should check
- Verification: scripts, tests, or review steps used to validate the decision
```

## Current Decisions

### ARD-001: Catalog Every Article Before Manual Normalization

- Date: 2026-05-05
- Status: Accepted
- Applies to:
  [`ARTICLE_REFERENCE_CONTENT_MIGRATION.md`](./ARTICLE_REFERENCE_CONTENT_MIGRATION.md)
- Decision: The migration catalog must include every article file, including
  files with no detected reference-like content.
- Reasoning: A full generated inventory prevents accidental omissions and keeps
  clean/prose-only articles visible during review.
- Consequences: The catalog is generated from repository content by
  `bun run references:catalog -- --write`; manual prose should not be added
  directly to generated article entries because it will be overwritten.
- Verification: The catalog generator test asserts one entry per article in its
  fixture corpus.

### ARD-002: Ordinary Prose Links Are Not Bibliography Entries

- Date: 2026-05-05
- Status: Accepted
- Applies to: Markdown links, raw URLs, and archive links across
  `src/content/articles/`
- Decision: Ordinary links remain prose links unless an article is explicitly
  edited to cite the source with a `cite-*` marker and matching `tpm-bibtex`
  entry.
- Reasoning: Links can be navigational, illustrative, archival, or incidental;
  inferring citation intent from link syntax would overstate bibliography data
  and distort author intent.
- Consequences: Articles can be marked `prose-links-only` even when they contain
  many external links. The global bibliography remains empty for those links
  until manual citation normalization promotes specific links into structured
  citation data.
- Verification: The audit and catalog tests cover prose links as inventoried
  but non-blocking content.

### ARD-003: Mechanical Cleanup Is Limited To Simple HTML Links And Paragraphs

- Date: 2026-05-05
- Status: Accepted
- Applies to:
  `src/content/articles/philosophy/an-internet-koan.md`,
  `src/content/articles/politics/social-media-freedom.mdx`
- Decision: The first mechanical pass may convert only simple raw HTML
  `<a href>` links and simple HTML paragraph wrappers into equivalent Markdown.
- Reasoning: These conversions preserve displayed text and destination while
  reducing legacy markup. They do not require deciding whether a link is a
  citation.
- Consequences: The mechanical pass converted seven simple raw HTML links and
  two simple paragraph wrappers. It intentionally did not create any `cite-*`,
  `note-*`, or `tpm-bibtex` syntax.
- Verification: `bun run references:migrate:mechanical -- --write` performed
  the pass; a follow-up dry run reports no remaining mechanical-safe changes.
  The script has focused tests and the site passed `bun run check`,
  `bun run build`, `bun run verify`, and `bun run validate:html`.

### ARD-004: Glossary Named Anchors Are Structural, Not Mechanical Link Cleanup

- Date: 2026-05-05
- Status: Accepted
- Applies to:
  `src/content/articles/metamemetics/glossary-1-dot-0.md`
- Decision: Raw HTML `<a name="..."></a>` anchors are not part of the
  mechanical link cleanup pass.
- Reasoning: They are in-page structural anchors used by the article's table of
  contents. Changing them requires a layout/anchor compatibility decision, not
  a citation migration.
- Consequences: `glossary-1-dot-0.md` remains `manual-required` because it has
  20 structural raw HTML anchors. A future pass may either preserve them with an
  explicit exception or migrate them to a supported heading-ID pattern after
  checking historical links.
- Verification: The mechanical migration script ignores named anchors, and the
  remaining audit reports exactly 20 raw HTML links from this article.

### ARD-005: Reference Sections Require Manual Classification Before BibTeX

- Date: 2026-05-05
- Status: Accepted
- Applies to:
  `src/content/articles/game-studies/gamergate-as-metagaming.md`,
  `src/content/articles/metamemetics/internetmemetics.md`,
  `src/content/articles/metamemetics/the-memeticists-challenge-remains-open.md`,
  `src/content/articles/metamemetics/what-is-a-meme.md`,
  `src/content/articles/philosophy/how-to-digitally-coauthor-articles-in-philosophy-class.md`,
  `src/content/articles/philosophy/postnaturalism.md`
- Decision: Reference and bibliography sections should not be automatically
  converted into `tpm-bibtex` entries without manual review.
- Reasoning: A visible reference-section entry may be a bibliography source,
  explanatory reading list item, incomplete citation, citation prose, or article
  artifact. BibTeX fields must be accurate enough to become structured site
  data.
- Consequences: Tooling can extract worklists, but a reviewer must classify each
  item before content rewrites. After classification, some renaming or insertion
  work may become scriptable.
- Verification: The audit records reference-section headings and leaves them as
  manual-review candidates.

### ARD-006: Existing Numeric Footnotes Need Note-Versus-Citation Review

- Date: 2026-05-05
- Status: Accepted
- Applies to:
  `src/content/articles/metamemetics/what-is-a-meme.md`,
  `src/content/articles/philosophy/postnaturalism.md`
- Decision: Numeric footnotes should not be mechanically renamed until each
  footnote is classified as an explanatory `note-*`, a bibliographic `cite-*`,
  or a mixed case requiring manual structure changes.
- Reasoning: Some footnotes are explanatory asides, some are source references,
  and some combine explanation with source material. Blind renaming would make
  invalid semantic states easy to create.
- Consequences: These articles remain manual-required. A later pass should
  produce an itemized classification table before applying any transformations.
- Verification: The catalog lists line-level footnote definitions and markers
  for both articles.

### ARD-007: Media Source Credits Stay Visible Until Reviewed

- Date: 2026-05-05
- Status: Accepted
- Applies to:
  `src/content/articles/memeculture/early-trash-dove.md`
- Decision: Media/source credit lines should remain visible article content
  until reviewed.
- Reasoning: Image credits are partly attribution and partly source context.
  They may need a different editorial treatment than bibliography citations.
- Consequences: The article remains manual-required with two media/source credit
  lines. A future decision should choose whether to keep them visible, convert
  them to structured image-credit metadata, or cite them as bibliography sources.
- Verification: The audit and catalog keep media/source credit lines separate
  from ordinary links and bibliography references.

### ARD-008: Stop After Mechanical Cleanup Until Review

- Date: 2026-05-05
- Status: Accepted
- Applies to: current article-reference migration phase
- Decision: After mechanical cleanup, stop before manual citation/reference
  classification.
- Reasoning: The remaining work changes citation semantics and should be
  reviewed article by article before content rewrites.
- Consequences: The current unresolved manual-review set is eight articles:
  `gamergate-as-metagaming.md`, `early-trash-dove.md`,
  `glossary-1-dot-0.md`, `internetmemetics.md`,
  `the-memeticists-challenge-remains-open.md`, `what-is-a-meme.md`,
  `how-to-digitally-coauthor-articles-in-philosophy-class.md`, and
  `postnaturalism.md`.
- Verification: `bun run references:audit` reports eight manual-review
  candidates after the mechanical pass.
