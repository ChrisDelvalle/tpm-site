---
title: Site Config Reference
description: A compact overview of the site config contract that future tools can edit safely.
date: 2026-05-05
author: Platform Team
tags:
  - configuration
  - reference
---

The site config is a serializable contract between site owners and the
platform. It is intentionally plain JSON so editors, command-line tools, and a
future GUI can all read and write the same source of truth.

## Identity

Identity fields define the site title, description, canonical URL, language,
and optional publisher metadata used by SEO, feeds, and document titles.

## Features

Feature flags control optional surfaces such as announcements, collections,
authors, tags, search, PDF generation, bibliography pages, and support blocks.
Disabled features should not remain visible in navigation.

## Defaults

Content defaults keep author frontmatter short. Site owners can decide whether
articles or announcements default to draft, feed visibility, homepage
visibility, search visibility, directory visibility, or PDF generation.
