---
title: Configurability Contracts
description: Decide which customization belongs in site config, component props, content, or platform defaults.
date: 2026-05-08
author: Platform Team
tags:
  - configuration
  - customization
  - reference
---

The platform separates customization by ownership. Site-wide editorial choices
belong in validated site config. Entry-specific choices belong in content.
Local presentation details belong in component props. Structural behavior stays
in platform defaults until there is a clear reason to expose it.

## Site Config

Use site config for choices a webmaster expects to manage across the whole
publication: homepage discovery links, section labels, share targets, support
links, feature flags, routes, navigation, and content defaults.

## Component Props

Use component props when a page already has the local context. Related-article
headings, category-specific labels, and one-off empty states should remain
close to the component that renders them unless multiple sites need the same
setting.

## Platform Defaults

Keep layout mechanics, third-party share endpoint builders, PDF export
structure, and article-card fitting behavior in the platform. These defaults
make common sites work without forcing owners to understand implementation
details.
