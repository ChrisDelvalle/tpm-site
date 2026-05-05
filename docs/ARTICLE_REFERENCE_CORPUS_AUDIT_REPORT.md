# Article Reference Corpus Audit Report

Generated from `bun run references:audit` on May 5, 2026.

This is a planning inventory only. It does not approve or perform article
content normalization.

## Summary

- Articles scanned: 61
- Manual review candidates: 10
- Canonical citation markers: 0
- Hidden `tpm-bibtex` blocks: 0
- Noncanonical footnote definitions: 40
- Noncanonical footnote markers: 42
- Reference-section headings: 6
- Raw HTML links: 27
- Markdown links inventoried as prose links: 362
- Archive links inventoried separately: 24
- Raw URLs inventoried as prose URLs: 344

## Manual Review Candidates

| Article                                                                                     | Detected legacy patterns                                                                                |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/content/articles/game-studies/gamergate-as-metagaming.md`                              | reference-section headings: 1                                                                           |
| `src/content/articles/memeculture/early-trash-dove.md`                                      | media/source credit lines: 2                                                                            |
| `src/content/articles/metamemetics/glossary-1-dot-0.md`                                     | raw HTML links: 20                                                                                      |
| `src/content/articles/metamemetics/internetmemetics.md`                                     | reference-section headings: 1                                                                           |
| `src/content/articles/metamemetics/the-memeticists-challenge-remains-open.md`               | reference-section headings: 1                                                                           |
| `src/content/articles/metamemetics/what-is-a-meme.md`                                       | noncanonical footnote definitions: 7; noncanonical footnote markers: 7; reference-section headings: 1   |
| `src/content/articles/philosophy/an-internet-koan.md`                                       | raw HTML links: 1                                                                                       |
| `src/content/articles/philosophy/how-to-digitally-coauthor-articles-in-philosophy-class.md` | reference-section headings: 1                                                                           |
| `src/content/articles/philosophy/postnaturalism.md`                                         | noncanonical footnote definitions: 33; noncanonical footnote markers: 35; reference-section headings: 1 |
| `src/content/articles/politics/social-media-freedom.mdx`                                    | raw HTML links: 6                                                                                       |

## Interpretation

The audit found no articles already using canonical bibliography citations.
Before `/bibliography/` can produce meaningful source listings, the manually
reviewed articles above need a content-normalization plan that converts true
sources into `[^cite-*]` markers plus `tpm-bibtex` entries, and converts
explanatory asides into `[^note-*]` footnotes.

The 362 Markdown links and 344 raw URL occurrences are intentionally not treated
as bibliography entries. They stay ordinary prose unless an article is
explicitly edited to cite them.
