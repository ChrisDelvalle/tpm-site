---
title: Quick Start
description: Build a site instance by editing config, content, assets, and public files.
date: 2026-05-07
author: Platform Team
image: ../../../assets/articles/quick-start/platform-map.svg
imageAlt: Diagram showing reusable platform code connected to a site instance.
tags:
  - platform
  - authoring
  - configuration
---

The platform treats a site as a configured instance. The platform owns routes,
components, validation, search, feeds, PDFs, and build tooling. The site owns
content, assets, public files, redirects, and editorial choices.

## Create A Site Instance

Start with four directories:

- `config/` for site identity, routes, navigation, defaults, feature flags, and
  redirects.
- `content/` for articles, announcements, authors, categories, collections, and
  pages.
- `assets/` for images and SVGs that should go through Astro's asset pipeline.
- `public/` for files copied directly to the generated site root.

![Platform and site split](../../../assets/articles/quick-start/platform-map.svg)

## Validate The Contract

Run `bun run site:doctor` after changing site config. The doctor checks
relationships that a JSON Schema cannot express clearly, such as navigation
links pointing at disabled features or homepage collections pointing at missing
files.
