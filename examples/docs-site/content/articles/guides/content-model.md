---
title: Content Model
description: Understand the small set of content types that drive platform pages.
date: 2026-05-06
author: Platform Team
image: ../../../assets/articles/content-model/content-model.svg
imageAlt: Diagram of the platform publishable content model.
tags:
  - platform
  - authoring
---

The author-facing model should stay small. Most site content is either a
publishable entry, a collection that orders publishable entries, or a page that
uses ordinary Markdown.

## Publishable Entries

Articles and announcements share the same basic frontmatter: title,
description, publication date, author, tags, draft state, and visibility. The
platform gives those fields defaults whenever it can, so authors only write
exceptions.

![Content model diagram](../../../assets/articles/content-model/content-model.svg)

## Collections

Collections are editor-owned lists. They are useful for homepage features,
starter reading, series pages, and curated topic pages because the editor can
choose a deliberate order without modifying article files.

## Pages

Standalone pages are for stable explanatory content such as about pages,
guides, and landing pages.
