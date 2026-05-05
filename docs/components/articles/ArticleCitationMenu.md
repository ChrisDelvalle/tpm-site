# Article Citation Menu

Source: `src/components/articles/ArticleCitationMenu.astro`

## Purpose

`ArticleCitationMenu` lets readers generate citations for the current TPM
article. It is a quiet article-header utility labeled `Cite this article` with
the Lucide `Quote` icon.

It must generate citations from structured article metadata, not from rendered
DOM text.

## Public Contract

Prefer a narrow normalized view model over a content collection entry:

```ts
interface ArticleCitationMenuViewModel {
  articleId: string;
  canonicalUrl: string;
  formats: readonly GeneratedArticleCitation[];
  title: string;
}

interface GeneratedArticleCitation {
  id: "bibtex" | "mla";
  label: "BibTeX" | "MLA";
  text: string;
}
```

The data helper, not the component, should receive article metadata:

- title;
- structured authors when available;
- legacy byline fallback;
- publication date;
- canonical URL;
- site name.

Initial formats:

- BibTeX;
- MLA;
- APA or Chicago only after a reliable formatter is implemented;
- CSL JSON as a structured export candidate, not necessarily visible in the
  first UI.

The component should receive display-ready generated strings from a helper such
as `src/lib/citations/article-citation.ts`. It should not hand-format citation
styles inline.

Do not include an accessed date in the first static implementation. Accessed
dates are reader-time data, while Astro output is build-time static HTML. A
future enhancement can add an optional dynamic accessed date deliberately, but
the first implementation should avoid pretending build date is reader access
date.

## Composition Relationships

```text
ArticleLayout
  ArticleHeader
    ArticleMeta
    ArticleCitationMenu
      Button or summary trigger
      citation format sections
      copy buttons
```

`ArticleHeader` owns placement. `ArticleCitationMenu` owns the revealable
article-citation UI. A small browser script may own clipboard enhancement, but
the citation text must remain visible and selectable without JavaScript.

## Layout And Responsiveness

The trigger should sit near article metadata without becoming a primary CTA.
It should wrap below metadata on narrow screens if needed rather than forcing
the metadata row to overflow.

The revealed panel should stay inside the article reading measure. Citation
text should use a stable scrollable/preformatted region that wraps or scrolls
without causing page-level horizontal overflow.

On mobile, the panel stacks format sections vertically. On wider screens, the
panel may use the same stacked shape unless a later design proves tabs or a
two-column layout improves usability.

## Layering And Scrolling

Prefer normal document flow or native `details` disclosure. Avoid popovers for
the first implementation; the citation output is utility content that should be
easy to inspect, select, and copy.

No sticky, fixed, or custom `z-index` behavior is intended.

## Interaction States

Trigger states:

- default;
- hover;
- focus-visible;
- open;
- disabled only if citation metadata is impossible to generate.

Copy button states:

- default;
- hover;
- focus-visible;
- copied;
- error when Clipboard API fails.

The copy action is progressive enhancement. If JavaScript is unavailable or
clipboard permission fails, readers can manually select the visible citation
text.

Copy state should be attached to the specific format button that was activated,
not to the whole menu. Multiple copy buttons may exist in the same article.

## Accessibility Semantics

Use a semantic button or native `summary` for the trigger. The trigger's
accessible name should be `Cite this article`.

Each generated citation format needs:

- a visible format label;
- visible selectable citation text;
- a copy button with an accessible label such as `Copy BibTeX citation`;
- status text for copied/error feedback that does not rely on color alone.

Keyboard users must be able to open the control, tab through formats, copy
buttons, and citation text areas, and close/collapse the section if native
disclosure is used.

## Content Edge Cases

Handle:

- long titles;
- titles with quotes, apostrophes, ampersands, and HTML entities;
- one author;
- multiple authors;
- anonymous authors;
- organizations and collectives;
- missing optional author metadata;
- old article dates;
- canonical URLs with trailing slashes;
- site title escaping in BibTeX and prose formats.

## Theme Behavior

Use semantic tokens. The trigger should feel like a secondary utility, not a
primary support button. The panel needs readable code/text surfaces in light and
dark mode, visible borders, and visible focus rings.

## Testable Invariants

- The trigger renders `Cite this article` with the Lucide `Quote` icon.
- Generated citations include title, author, date, canonical URL, and site name
  where each format requires them.
- Citation text remains visible and selectable without JavaScript.
- Copy buttons use Lucide `Copy` and have format-specific accessible labels.
- Copy success and failure states are announced or visible.
- Long generated citations do not overflow the article reading measure.
- Metadata row and citation trigger do not overlap at mobile, tablet, desktop,
  or wide widths.
- Anonymous, organization, and multiple-author articles produce deterministic
  output.

## Follow-Up Notes

- If MLA/APA/Chicago output proves too nuanced to hand-format safely, add a
  CSL/citeproc-backed formatter and keep BibTeX as the first implemented
  format.
- Do not add citation-manager export formats opportunistically. Each format
  needs tests and clearly documented field behavior.
