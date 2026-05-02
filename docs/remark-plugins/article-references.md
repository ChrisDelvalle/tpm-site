# Article References Remark Plugin Design

## Purpose

The article references plugin gives The Philosopher's Meme one canonical way to
handle explanatory footnotes and bibliographic citations in Markdown and MDX
articles.

The plugin should make this true:

- authors can use normal Markdown footnote syntax;
- explanatory notes and source citations are distinguishable by label;
- invalid reference state fails early with clear messages;
- article layouts can render notes, bibliography, and bibliography pages through
  normal Astro components;
- article wording remains author-owned and is not rewritten by incidental UI
  work.

This is publication infrastructure, not a reusable package. Implement it inside
this repository under `src/remark-plugins/` unless it later proves useful
outside the project.

## Context

The current article corpus uses several source/citation patterns:

- explicit `References`, `Reference`, and `Bibliography` sections;
- Markdown footnotes used for explanatory notes;
- Markdown footnotes used as bibliography references;
- bracket-style bibliography entries such as `\[1\]`;
- plain inline links that may be citations, source links, media credits,
  contextual links, or normal prose links;
- raw HTML links and MDX component links in a small number of articles.

The project should not infer bibliography data from every inline link. Inline
links are too ambiguous. The canonical future format should be explicit enough
to parse without editorial guesswork.

The finished implementation should support Markdown/MDX footnote labels:

```md
This is a cited claim.[^cite-evnine-2018]
This sentence needs an explanatory aside.[^note-context]

[^cite-evnine-2018]: Evnine, Simon J. "The Anonymity of a Murmur." 2018.

[^note-context]: This term is being used in the narrower internet-meme sense.
```

`cite-*` labels become bibliography entries. `note-*` labels become article
footnotes. Other footnote labels should fail once this plugin is enabled for
published articles.

Notes and citations may optionally provide a display label at the start of the
definition body:

```md
This claim cites an author-year source.[^cite-baudrillard-1981]

[^cite-baudrillard-1981]: [@Baudrillard 1981] Baudrillard, Jean. _Simulacra and Simulation_. 1981.
```

When no display label is provided, references render with ordinary numeric
markers. Rendering components may choose whether to use display labels,
depending on the reference kind and site design. Citation components will likely
render explicit labels when present; note components may still render numeric
markers while preserving labels as metadata for accessibility or future display
changes. The label is explicit author-provided display text; the plugin must not
infer labels from bibliography or note prose.

This syntax deliberately stays inside normal GFM footnotes. `remark-gfm` parses
the definition as an ordinary `footnoteDefinition`; the article references
plugin then interprets `cite-*` definitions as bibliography entries and consumes
an optional leading `[@Display Label]` marker from `cite-*` and `note-*`
definitions. This avoids custom Markdown block parsing and preserves GFM
footnote continuation behavior.

## Non-Goals

- Do not use `remark-toc` for the article sidebar. Article table-of-contents
  components should use `render(entry).headings`.
- Do not parse arbitrary inline links as bibliography entries.
- Do not hide citation rendering inside article prose if component rendering is
  feasible.
- Do not add a git submodule or separate package for this project-specific
  plugin.
- Do not mutate article wording while implementing the plugin.

## Authoring Contract

Article authors use GitHub-Flavored Markdown footnote syntax.

Allowed labels:

- `[^note-<slug>]`: an explanatory article footnote.
- `[^cite-<slug>]`: a bibliographic citation.

Label rules:

- Labels use lowercase ASCII slugs: `a-z`, `0-9`, and `-`.
- Labels must start with `note-` or `cite-`.
- Labels must be unique within an article.
- Every reference must have exactly one definition.
- Every definition must be referenced at least once.
- Duplicate references to the same citation are allowed and should point to one
  bibliography entry.
- Note and citation definitions may start with `[@<display label>]` to provide
  optional human display text.
- Display labels are plain text. They must be the first inline content in the
  definition, must not contain `]`, and should be short enough to work inline if
  a renderer chooses to show them.
- Display labels are declared once at the definition site and apply to every
  body reference to that note or citation.
- Only a valid `[@...]` marker at the first inline position is display-label
  metadata. A malformed marker at that first position fails. A later `[@...]`
  sequence is ordinary definition content, not metadata.
- Duplicate references to the same note are allowed only if the design explicitly
  chooses to support repeated note markers; otherwise fail to avoid confusing
  note numbering.

Canonical examples:

```md
Memes can operate as diagram games.[^cite-diagram-games]

[^cite-diagram-games]:
    Her, Seong-Young. "Memes Are Not Jokes; They Are Diagram
    Games." The Philosopher's Meme, 2017.
```

```md
This is a source with the default numeric marker.[^cite-baudrillard-1981]

[^cite-baudrillard-1981]: Baudrillard, Jean. _Simulacra and Simulation_. 1981.
```

```md
This is a source with an explicit author-year marker.[^cite-baudrillard-1981]

[^cite-baudrillard-1981]: [@Baudrillard 1981] Baudrillard, Jean. _Simulacra and Simulation_. 1981.
```

```md
The term is being used narrowly here.[^note-term-scope]

[^note-term-scope]:
    This article uses "meme" in the internet-meme sense, not in
    the broader Dawkinsian sense.
```

```md
The term is being used narrowly here.[^note-term-scope]

[^note-term-scope]:
    [@term scope] This article uses "meme" in the internet-meme sense, not
    in the broader Dawkinsian sense.
```

## Markdown Plugin Model In This Project

Astro renders article bodies through content collections:

```astro
---
import { render } from "astro:content";

const { Content } = await render(article);
---

<Content />
```

Astro's Markdown pipeline is powered by unified/remark/rehype. A remark plugin
is an ESM function that returns a transformer:

```ts
import type { Root } from "mdast";
import type { Plugin } from "unified";

export const remarkArticleReferences: Plugin<[], Root> = () => {
  return (tree, file) => {
    // inspect and transform the Markdown AST
  };
};
```

The transformer receives the Markdown AST and a `VFile`. The tree contains
parsed Markdown nodes. The file carries path, messages, errors, and custom
metadata.

Astro's `markdown.gfm` option is enabled by default. GFM footnotes parse into
mdast nodes:

- `footnoteReference` where the article body contains `[^label]`;
- `footnoteDefinition` where the article defines `[^label]: ...`.

The plugin should use parsed nodes rather than regexing source text. Because
display labels live inside normal GFM footnote definitions as `[@...]`, the
transformer stage can classify and normalize parsed `footnoteReference` and
`footnoteDefinition` nodes without custom micromark block parsing.

The plugin is wired through `astro.config.ts`:

```ts
import { remarkArticleReferences } from "./src/remark-plugins/articleReferences";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkArticleReferences],
  },
});
```

Keep GFM enabled unless a future implementation proves that disabling default
GFM footnote output is safer than consuming/replacing the footnote nodes.

MDX extends the project Markdown config by default in Astro, so the same plugin
should apply to `.md` and `.mdx` article content.

## Parser And Normalization Architecture Requirements

This plugin contains real parsing and normalization work. Do not wing it with
broad regex passes or post-render HTML manipulation. Follow normal parser
architecture: define the syntax, parse it into typed intermediate data, then
normalize and render from that data.

Apply "parse, don't validate":

- The GFM parser boundary should turn raw Markdown footnote syntax into mdast
  nodes.
- The project normalization boundary should turn mdast footnote nodes into typed
  article reference data or fail with a precise diagnostic.
- Later stages should not repeatedly ask whether a string "looks like" a
  citation. They should receive an already-classified note or citation.
- Invalid syntax should not survive as a loosely typed object that rendering
  code has to defensively reinterpret.

The display-label grammar should be explicit and small:

```text
display-label-marker =
  "[@", display-label, "]"

display-label-marker-position =
  first inline content of a cite-* or note-* footnote definition paragraph

display-label =
  nonempty plain text, trimmed, with no "]" or line break
```

Definition bodies use normal GFM footnote parsing and therefore support rich
Markdown content and GFM continuation behavior. The plugin should remove the
display-label marker from the rendered definition content while preserving the
remaining rich Markdown content exactly.

Use type-driven design so invalid states are unrepresentable after parsing.
Conceptually, prefer discriminated shapes:

```ts
type ParsedReferenceDefinition =
  | ParsedCitationDefinition
  | ParsedNoteDefinition;

interface ParsedCitationDefinition {
  kind: "citation";
  label: CitationLabel;
  displayLabel?: CitationDisplayLabel;
  children: readonly DefinitionChild[];
}

interface ParsedNoteDefinition {
  kind: "note";
  label: NoteLabel;
  displayLabel?: NoteDisplayLabel;
  children: readonly DefinitionChild[];
}
```

Do not model this as one bag of optional properties where notes can accidentally
carry citation-only state, or citations can accidentally miss their citation
kind. Use branded/string-refined types where useful for labels, display labels,
HTML IDs, and generated backref IDs.

Keep concerns separate:

1. GFM parsing: provided by `remark-gfm`, creates `footnoteReference` and
   `footnoteDefinition` nodes.
2. Domain normalization: collects references and definitions, extracts optional
   `[@...]` display labels from notes and citations, assigns order,
   generates IDs, and creates the article-reference data model.
3. Validation/reporting: turns missing, duplicate, repeated-note, and malformed
   states into `VFile` diagnostics.
4. Rendering/data bridge: serializes safe metadata for Astro components or
   produces generated AST sections if the fallback path is required.
5. Astro components: render notes, bibliography, markers, and backrefs from the
   normalized model.

Keep pure logic pure. Label parsing, ID generation, ordering, duplicate
detection, and display-label normalization should be deterministic functions
tested without Astro. The remark transformer may mutate the AST because that is
how unified plugins work, but it should mostly orchestrate pure helpers.

Use exhaustive handling. A switch on `kind` should have a `never` fallback in
TypeScript tests or implementation so adding a new reference kind cannot silently
skip validation or rendering.

Parser and normalization tests should be table-driven and include both accepted
and rejected grammar cases. Include fixtures for spacing, indentation,
continuation blocks, rich inline Markdown, repeated references, malformed
labels, display labels on notes, and cases that must remain ordinary prose.

## Proposed File Structure

```text
src/remark-plugins/
  articleReferences.ts

src/lib/article-references/
  model.ts
  normalize.ts
  render-nodes.ts
  validate.ts

tests/src/remark-plugins/
  articleReferences.test.ts

tests/src/lib/article-references/
  normalize.test.ts
  validate.test.ts
```

Keep the remark transformer thin. Put pure classification, normalization, and
validation logic in `src/lib/article-references/` so it can be tested without
running Astro.

If the implementation is small enough, the `src/lib/article-references/` split
can start with fewer files. Do not put unrelated content helpers in
`src/remark-plugins/`; that directory is only for remark plugins.

## Data Model

The plugin should produce normalized data shaped like this conceptually:

```ts
interface ArticleReferenceData {
  citations: readonly ArticleCitation[];
  notes: readonly ArticleNote[];
}

interface ArticleCitation {
  id: string;
  label: string;
  order: number;
  displayLabel: string | undefined;
  references: readonly ArticleReferenceMarker[];
  definition: ArticleReferenceDefinitionContent;
}

interface ArticleNote {
  id: string;
  label: string;
  order: number;
  displayLabel: string | undefined;
  references: readonly ArticleReferenceMarker[];
  definition: ArticleReferenceDefinitionContent;
}

interface ArticleReferenceMarker {
  id: string;
  order: number;
}

interface ArticleReferenceDefinitionContent {
  id: string;
  children: readonly unknown[];
}
```

`children` should remain AST content or a similarly renderable representation
until the implementation proves the exact rendering path. Avoid flattening rich
Markdown definitions to plain strings too early; citation entries may contain
italics, links, punctuation, or non-URL sources.

The data must support:

- article-local note rendering;
- article-local bibliography rendering;
- global `/bibliography/` generation;
- article back-links from bibliography entries;
- validation and author-facing error messages.

In Astro, prefer exposing this data through `render(entry)`'s
`remarkPluginFrontmatter` result. Local Astro and MDX content types expose
`remarkPluginFrontmatter`, so implementation should start with a focused proof
that rich citation definition nodes can be carried through this path in a form
components can render safely.

## Rendering Contract

Parsing and rendering should be separate concerns. The plugin validates and
normalizes article references; rendering components decide how those normalized
references appear.

Notes render as ordinary numbered footnotes:

```text
Body text.1
```

Notes may carry an optional display label, but the default renderer should still
render ordinary numeric markers unless the note component design explicitly
chooses a different presentation.

Citations render as numeric markers by default:

```text
Claim.[1]
```

Citations with an explicit definition display label render with that label:

```md
Claim.[^cite-baudrillard-1981]

[^cite-baudrillard-1981]: [@Baudrillard 1981] Baudrillard, Jean. _Simulacra and Simulation_. 1981.
```

```text
Claim.[Baudrillard 1981]
```

The display label is part of the rendering interface, not the canonical
identity. The stable identity remains the `note-*` or `cite-*` label. The full
note or bibliography entry is the definition content; the display label is not
part of that rendered definition text unless the final component design
deliberately includes it.

The plugin should therefore expose both:

- a stable reference identity such as `cite-baudrillard-1981` or
  `note-term-scope`;
- an optional display label such as `Baudrillard 1981` or `term scope`;
- the rich note or bibliography definition content.

Do not parse author, title, year, or display labels from unstructured definition
prose. Only the explicit `[@...]` syntax controls display-label metadata.

## Output Strategy

Preferred implementation:

1. The remark plugin validates labels and reference/definition relationships.
2. It suppresses Astro's default combined GFM footnote output by consuming or
   replacing the relevant footnote nodes.
3. It exposes structured notes/citations metadata through the safest Astro
   metadata path available.
4. `ArticleReferences` renders `ArticleFootnotes` and `ArticleBibliography`
   after `ArticleEndcap` and before `ArticleTags`.

If the proof demonstrates that rich rendered citation content cannot be passed
cleanly to components through `remarkPluginFrontmatter`, use this fallback:

1. The plugin still validates and classifies references.
2. The plugin injects generated note and bibliography sections into the mdast
   tree at a controlled location.
3. The generated sections use stable IDs and data attributes so components/tests
   can reason about them.
4. This fallback must still satisfy the same article rendering, accessibility,
   validation, and ordering requirements as the component-rendered path.

Do not choose the fallback until the proof of concept confirms that metadata
cannot be passed cleanly from the Markdown pipeline to the article layout.

## Article Footer Placement

The article footer order should stay intentional:

1. article prose;
2. support CTA;
3. more in category / related discovery;
4. article notes and bibliography;
5. tags as the final surface.

If the plugin injects sections directly, it must not violate that ordering. That
is one reason component-rendered bibliography data is preferred.

## Validation Requirements

Blocking errors:

- footnote label does not start with `note-` or `cite-`;
- label contains characters outside the canonical slug rules;
- body reference has no matching definition;
- definition has no matching body reference;
- duplicate definition label;
- repeated `note-*` reference;
- malformed display label marker at the first inline position;
- the same label is somehow classified differently;
- generated HTML IDs collide within the article;
- plugin cannot distinguish a note from a citation.

Review-only warnings, if useful later:

- citation definition looks like a bare URL with no title/context;
- citation definition contains a dead URL, if a link checker is added;
- unusually long note or citation text;
- legacy explicit references section still exists in an article that also uses
  canonical `cite-*` labels;
- possible malformed legacy bibliography item such as an orphan caret marker.

Use `file.fail(...)` for blocking errors and `file.message(...)` for warnings.
Messages should be author-readable: say what is wrong, show the label, and say
how to fix it.

Example message:

```text
Invalid article reference label "[^source-1]". Use "[^note-...]" for
explanatory notes or "[^cite-...]" for bibliography citations.
```

## AST Transformation Requirements

The plugin should:

- visit every `footnoteReference` node;
- collect every `footnoteDefinition` node;
- extract and remove an optional leading `[@...]` display label marker from
  `note-*` and `cite-*` definitions;
- classify identifiers by prefix;
- preserve first-reference order for numbering;
- keep multiple references to the same citation connected to one citation entry;
- generate deterministic IDs for references, definitions, and backrefs;
- remove or replace consumed `footnoteDefinition` nodes so default GFM footnote
  rendering does not produce a competing combined footnotes block;
- replace `footnoteReference` nodes with accessible link/sup markup or a
  renderable marker representation chosen in implementation;
- preserve rich definition content such as emphasis, links, code, and inline
  punctuation;
- avoid rewriting surrounding paragraph text.

ID conventions should be deterministic and scoped:

```text
note-term-scope
note-ref-term-scope
cite-diagram-games
cite-ref-diagram-games
```

For repeated citation references, append stable numeric suffixes to backref IDs.
Repeated note references fail validation.

## Accessibility Requirements

Rendered reference markers should:

- be keyboard-focusable links;
- have meaningful accessible text;
- point to the rendered note or bibliography entry;
- provide return links from entries back to the source reference where feasible;
- not rely on hover-only behavior;
- work without client-side JavaScript.

Rendered notes and bibliography sections should:

- have real headings;
- use ordered lists when numbering communicates order;
- preserve readable prose and link semantics;
- not create duplicate landmarks;
- remain compatible with Tailwind Typography.

## Bibliography Page Implications

The global `/bibliography/` page is a later milestone. This plugin must make
that page possible by creating dependable data:

- normalized citation labels;
- citation content;
- source article ID/title/URL/category/date;
- duplicate-source handling hooks;
- article back-link data.

The plugin does not deduplicate sources globally, but it must not make global
deduplication impossible. Avoid baking display numbering into the canonical data
model.

## Migration Strategy

Migration should be separate from plugin implementation.

Recommended order:

1. Implement and test the plugin with isolated fixtures.
2. Run the plugin against known canonical fixture articles.
3. Add an audit script or test fixture for the current article corpus.
4. Normalize one article format at a time with careful manual review.
5. Enable blocking validation for published articles only after the corpus has
   been normalized or approved exceptions exist.

Article-content edits require explicit instruction and manual verification.
Do not opportunistically rewrite article prose while building the plugin.

Known corpus cases to model in fixtures:

- one article using only `note-*` explanatory footnotes;
- one article using only `cite-*` bibliography citations;
- one article using both notes and citations;
- repeated citation reference;
- repeated note reference failure;
- note definition with display label;
- citation definition with display label;
- note and citation definitions with display labels and rich Markdown content;
- `[@...]` text later in the definition body that should remain ordinary
  definition content;
- rich citation content with links/emphasis;
- invalid legacy label;
- missing definition;
- unreferenced definition;
- duplicate definition.

## Tests

Unit tests:

- label classification;
- slug validation;
- duplicate detection;
- missing reference/definition detection;
- first-reference ordering;
- repeated citation handling;
- repeated note failure;
- deterministic ID generation;
- display-label extraction from `note-*` and `cite-*` definitions;
- rich definition preservation.

Plugin integration tests:

- process Markdown with `remark`, `remark-gfm`, and the plugin;
- prove `[@...]` markers are extracted only from valid `note-*` and `cite-*`
  definitions;
- assert transformed output or transformed AST;
- assert `file.fail` behavior for blocking invalid input;
- assert `file.message` behavior if warnings are implemented.

Astro integration tests:

- ensure `.md` and `.mdx` content both run through the plugin;
- ensure article pages do not render Astro's default combined GFM footnote
  section in addition to the custom note/bibliography sections;
- ensure article end ordering remains support, discovery, references, tags;
- ensure build fails on invalid published article references.

E2E/accessibility tests:

- reference markers are links;
- keyboard focus reaches reference markers and backrefs;
- note/bibliography headings are sensible;
- no duplicate IDs;
- no horizontal overflow caused by long citation text or URLs;
- light and dark modes preserve readable reference links and focus rings.

## Implementation Checklist

- Add direct dependencies if needed, rather than relying on transitive
  dependencies:
  - `unist-util-visit`;
  - `@types/mdast` if TypeScript needs explicit mdast node types;
  - `remark` and `remark-gfm` as dev dependencies if plugin tests process
    Markdown outside Astro.
- Add `src/remark-plugins/articleReferences.ts`.
- Add pure helpers under `src/lib/article-references/` where useful.
- Add tests for display-label normalization before wiring the plugin into
  production article rendering.
- Add the plugin to `astro.config.ts` under `markdown.remarkPlugins`.
- Verify MDX inherits the Markdown config.
- Confirm the default GFM footnote renderer is suppressed or replaced.
- Update article submission docs with the canonical `note-*` and `cite-*`
  syntax after implementation is stable.
- Update `CHECKLIST.md` and bibliography design docs if implementation exposes
  new requirements.

## Resolved Decisions

No core behavior should remain open before implementation. Current decisions:

- Metadata path: use `render(entry).remarkPluginFrontmatter` if the proof of
  concept confirms rich citation content can be rendered safely from that data.
  Otherwise inject generated sections from the plugin as the documented
  fallback.
- Repeated references: repeated `cite-*` references are allowed; repeated
  `note-*` references fail.
- Unreferenced definitions: fail for notes and citations. Further reading should
  be a separate future content type, not an uncited citation.
- Article-local rendering: render notes and bibliography through article
  components when metadata works; use ordered lists because ordering communicates
  citation/note order.
- Validation timing: do not enable release-blocking validation against the full
  published corpus until the article migration plan has normalized existing
  content or recorded explicit exceptions. The finished plugin itself should be
  strict.
- Global deduplication: do not fuzzy-deduplicate bibliography entries. If global
  source deduplication is needed, add explicit canonical source IDs instead of
  guessing from prose.

## Reference Docs

- [unified guide: create a remark plugin](https://unifiedjs.com/learn/guide/create-a-remark-plugin/)
- [vfile messages and file data](https://unifiedjs.com/explore/package/vfile/)
- [mdast footnote nodes](https://github.com/syntax-tree/mdast)
- [Astro Markdown plugins](https://docs.astro.build/en/guides/markdown-content/#markdown-plugins)
- [Astro content rendering and headings](https://docs.astro.build/en/guides/content-collections/#rendering-body-content)
