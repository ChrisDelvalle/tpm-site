# Agent Instructions

## Bun Usage

Default to Bun for package management, scripts, tests, and local tooling.

- Use `bun install` instead of `npm install`, `yarn install`, or `pnpm install`.
- Use `bun run <script>` instead of `npm run <script>`, `yarn run <script>`, or
  `pnpm run <script>`.
- Use `bunx <package> <command>` instead of `npx <package> <command>` when a
  package runner is needed.
- Prefer Bun scripts for repository automation when the script can run cleanly
  under Bun.
- Do not introduce Ruby, Bundler, or Jekyll dependencies into the Astro build
  path.

When an existing script currently uses `node`, keep it working unless the task
explicitly includes converting the script to Bun. Avoid churn that is unrelated
to the active milestone.

## Project Overview

The Philosopher's Meme is a Bun-first Astro static site migrated from Jekyll.

The project has three major concerns:

- Preserve article content and historically important metadata.
- Rebuild the site as modern responsive Astro/Tailwind components.
- Keep the authoring model simple: adding Markdown or MDX articles should not
  require touching application code.

The current Astro UI is a migration prototype. It can guide tone, palette, and
content structure, but it is not an architectural contract. Prefer professional
Astro, Tailwind, accessibility, and performance standards over preserving early
migration implementation details.

## Project Map

- `docs/`: current source-of-truth legacy content during the migration.
- `src/content/legacy/`: generated content mirror. Do not edit by hand.
- `src/pages/`: Astro routes.
- `src/layouts/`: shared page and article layouts.
- `src/components/`: target home for reusable Astro UI, layout, navigation,
  article, and block components.
- `src/lib/`: content, route, metadata, and domain helpers.
- `src/styles/`: global foundation styles. Keep this small.
- `public/`: static files copied directly to build output.
- `scripts/`: repository maintenance, migration, sync, and verification scripts.
- `dist/`: generated build output. Do not edit by hand.
- `CHECKLIST.md`: migration milestone tracking.
- `MIGRATION_COMPLETION_PLAN.md`: cleanup and legacy removal plan.
- `DESIGN_PHILOSOPHY.md`: architecture and design principles.
- `QUALITY_TOOLING.md`: target quality tooling and release checks.

## Architecture Policy

Build the site from responsive design blocks and responsive components.

Default approach:

- Astro components for site UI.
- Tailwind CSS for component styling.
- Tailwind Typography for Markdown-rendered article prose.
- Markdown for normal articles.
- MDX for future articles that need custom components.
- Build-time Astro content collections for article data.
- Static HTML output by default.
- Hydrated islands only when interaction requires them.

The component model should be:

```text
Pages
  compose responsive Blocks

Blocks
  compose responsive Components

Components
  compose responsive UI primitives
```

Every component should own its own responsive behavior, spacing, wrapping,
focus states, dark mode behavior, and accessibility semantics. Do not fix
component layout failures with page-level CSS patches.

## Tailwind And Styling Policy

Use Tailwind as the default styling system.

Use Tailwind for:

- layout;
- spacing;
- sizing;
- responsive behavior;
- typography;
- color;
- borders;
- radius;
- shadows;
- focus, hover, active, and disabled states;
- dark mode variants.

Keep global CSS tiny and foundational. It should mainly contain Tailwind
imports, design tokens, light/dark variables, font setup, base document styles,
and Markdown prose customization.

Do not add large handcrafted SCSS/CSS files. Do not add arbitrary one-off
breakpoint patches when a component should be redesigned.

Gradients are not part of the current visual direction unless explicitly
re-approved.

## Content Policy

Article content fidelity is strict.

- Do not rewrite article bodies unless the user explicitly asks.
- Preserve existing meaningful metadata.
- Keep legacy permalink data as metadata, but do not let it drive core routing
  once the cleanup plan is implemented.
- Ensure drafts and unpublished content remain unpublished.
- Article authors should not need to edit routes, navigation, RSS, sitemap,
  search indexing, or build scripts to publish a normal article.

Current migration state:

- Legacy content lives in `docs/`.
- `scripts/sync-content.mjs` generates `src/content/legacy/`.
- `src/content/legacy/` is disposable generated output.

Target content state is documented in `MIGRATION_COMPLETION_PLAN.md`.

## Astro Policy

Use Astro's static-first model.

- Prefer build-time content collections.
- Render Astro components to static HTML unless interactivity requires
  hydration.
- Use `render(entry)` from `astro:content` for Markdown/MDX article bodies.
- Keep route helpers centralized.
- Keep duplicate slug detection deterministic.
- Do not rely on Markdown `layout` frontmatter for collection entries.
- Avoid client-side routing unless there is a strong product reason.

Use Astro docs as the source of truth when uncertain. This project has an Astro
Docs MCP server available in Codex sessions.

## Islands And Hydration Policy

Hydration is an exception.

Allowed client behavior should be small and explicit, such as:

- mobile navigation;
- theme toggle persistence;
- search enhancement;
- future article-specific MDX interactions.

Do not hydrate large layout regions. Do not ship React for static content. If
React or shadcn/Radix components are added, prerender static components and
hydrate only the smallest interactive boundary.

Use client directives deliberately:

- `client:load` only for immediately needed above-the-fold interaction.
- `client:idle` for lower-priority interaction.
- `client:visible` for below-the-fold or heavy interaction.
- `client:media` for viewport-specific interaction.
- Avoid `client:only` unless server rendering is impossible.

## Performance Policy

Treat production output as the performance source of truth.

- `bun run build` produces the deployable `dist/` directory.
- Astro/Vite own project CSS and processed client JavaScript.
- Built project assets should appear under hashed `_astro/` filenames when they
  are emitted as files.
- Pagefind owns generated search assets under `dist/pagefind/`.
- Files in `public/` are copied as-is and should already be production-ready.

Keep reading pages static by default. Avoid adding client JavaScript to article,
topic, archive, RSS, sitemap, and ordinary content pages unless the feature
requires it. Route-local interaction is preferred: search code should stay on
search pages, and MDX interaction should stay on articles that use it.

Use `is:inline` sparingly. It is appropriate for tiny boot scripts such as
initial theme setup, but it skips Astro's script processing. Normal component
scripts should let Astro process, bundle, deduplicate, and optimize them.

Images need explicit care. New component-controlled images should use Astro
image tooling where possible, stable dimensions or aspect ratios, responsive
sizes, useful alt text, and deliberate loading priority. Do not add oversized
uploads or meaningful background images when a real image element would be more
performant and accessible.

## Quality Gate

When making code changes, run the relevant repository QA tooling before handoff
and fix issues it reports. Use repository scripts, not ad hoc command chains.
Keep QA commands simple and transparent. Do not add clever wrapper scripts,
suppressed output, or copied flags unless their behavior is understood and the
reason is documented.

Current baseline scripts:

- `bun run dev`: start Astro dev server after content sync.
- `bun run check`: run content validation, Astro typechecking, ESLint,
  Markdown/config linting, package ordering, Prettier check, Knip, and unit
  tests.
- `bun run build`: sync content, build Astro, and generate Pagefind index.
- `bun run verify`: verify built output.
- `bun run validate:html`: validate shell/index HTML in built output.
- `bun run test:e2e`: run Playwright smoke/responsive/search tests.
- `bun run test:a11y`: run axe accessibility tests.
- `bun run test:perf`: run Lighthouse CI.
- `bun run check:release`: run the heavy pre-release validation gate.
- `bun run fix`: run safe automatic fixes.

For code, config, and formatted documentation changes, prefer running the safe
automatic fixer before the normal check once `bun run fix` exists:

```sh
bun run fix
bun run check
```

This keeps mechanical formatting, import ordering, and safe lint autofixes out
of the reasoning path. Inspect the diff afterward when the fixer touches files
where content fidelity matters.

If a check cannot be run, say so in the final handoff with the reason.

## Coding Policy

The intended code policy is strict TypeScript with tooling as the source of
truth.

Core principles:

- Prefer simple, explicit, maintainable code over clever abstractions.
- Keep changes narrowly scoped.
- Preserve module boundaries unless there is a clear reason to improve them.
- Use `const` by default and `let` only for reassignment.
- Avoid `any`; parse `unknown` at boundaries.
- Avoid non-null assertions.
- Prefer exhaustive handling for finite states and discriminated unions.
- Keep side effects behind narrow boundaries.
- Keep pure logic easy to test.
- Prefer typed domain objects over passing raw content entries deep into UI.
- Throw `Error` instances, not strings or arbitrary values.
- Do not leave silent `catch` blocks.
- Keep exports intentional and minimal.
- Remove dead code rather than preserving it for possible future use.
- Use useful comments for invariants and non-obvious tradeoffs, not narration.

Default exports are acceptable where Astro or tool config conventions expect
them. Prefer named exports for reusable TypeScript modules.

## Dependency And Security Policy

Do not add dependencies casually.

Runtime dependencies need clear justification because they affect performance,
security, install weight, and long-term maintenance.

Prefer:

- Astro built-ins.
- Web platform APIs.
- Existing project helpers.
- Small focused libraries with clear value.
- shadcn/Radix patterns only when they improve accessibility or interaction
  quality enough to justify the cost.

Avoid:

- analytics or tracking scripts without explicit approval;
- remote-code loading;
- large client libraries for small interactions;
- dependencies that duplicate existing project utilities;
- packages that undermine static-first output.

Security tooling targets are documented in `QUALITY_TOOLING.md`, including
gitleaks, dependency audit, Dependency Review, and CodeQL.

## Testing Policy

Test behavior through intended public APIs. Do not export implementation details
only to make tests easier.

Use unit tests for:

- slug generation;
- topic derivation;
- draft filtering;
- metadata normalization;
- route helpers;
- duplicate slug detection;
- image path validation;
- RSS/sitemap/search filtering;
- migration helpers.

Use Playwright for user-visible browser behavior:

- homepage;
- article pages;
- article archive;
- topic pages;
- mobile navigation;
- theme toggle;
- search;
- no horizontal overflow;
- representative responsive viewports.

Use axe accessibility checks for representative pages once the tooling is in
place. Use Lighthouse CI for performance, accessibility, best practices, and SEO
release gates once configured.

## Checklist Workflow

Use `CHECKLIST.md` for migration milestones and materially important
verification work.

Before starting a non-trivial implementation phase, update the checklist or the
relevant migration/design tooling document so the intended work is reviewable.
Mark checklist items complete as they are finished.

Do not use the checklist as a dumping ground for routine QA commands. Routine
tooling expectations belong in this file and `QUALITY_TOOLING.md`.

## Generated And Legacy Files

Do not edit generated files by hand.

Generated or disposable paths include:

- `dist/`
- `src/content/legacy/`
- `.astro/`
- Pagefind output under built `dist/`
- coverage output once test coverage is enabled

Legacy files should be handled carefully during migration cleanup. Do not delete
or rename legacy content, assets, or metadata unless the active task explicitly
includes that cleanup and the relevant migration plan/checklist has been
updated.

## Handoff Policy

Final handoffs should include:

- what changed;
- which checks were run;
- which checks were not run and why;
- any remaining risks or follow-up work.

Keep handoffs concise. Do not describe unrelated worktree changes unless they
affect the task.
