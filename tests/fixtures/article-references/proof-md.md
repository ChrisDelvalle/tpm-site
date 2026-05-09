---
title: "Markdown Article Reference Proof"
description: "Markdown fixture for the article-reference data-path proof."
---

Markdown can cite a source.[^cite-baudrillard-1981]

Markdown can also carry an explanatory note.[^note-term-scope]

[^note-term-scope]: [@term scope] This note preserves _emphasis_, [links](https://example.com/note), and `inline code`.

```tpm-bibtex
@book{baudrillard-1981,
  author = {Baudrillard, Jean},
  title = {Simulacra and Simulation},
  year = {1981},
  url = {https://example.com/source}
}
```
