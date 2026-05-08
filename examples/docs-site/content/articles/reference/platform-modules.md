---
title: Platform Modules
description: Understand the reusable module boundaries that keep site-specific choices out of the platform.
date: 2026-05-07
author: Platform Team
tags:
  - platform
  - configuration
  - reference
---

The platform is organized around durable domains instead of one-off pages or
publication-specific features. Site owners edit config, content, assets, public
files, and theme tokens. Platform modules own reusable behavior.

## Core Domains

The main reusable domains are content, routes and features, article rendering,
PDF output, references and bibliography, interaction primitives, and shared
utilities. Each `src/lib` module should belong to one of those domains.

## Site Boundary

Reusable modules should not import concrete site assets or site files. They
should read site-specific values through config adapters, content loaders, or
explicit component props. The site instance remains the source of truth for
branding, routes, support links, social handles, and editorial copy.

## Boundary Checks

Run `bun run platform:check` to verify that platform modules have owners and
that core platform files do not regain obvious site-specific coupling.
