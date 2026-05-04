# Action Cluster

Source: `src/components/ui/ActionCluster.astro`

## Purpose

`ActionCluster` is a small no-JavaScript primitive for inline groups of actions
such as icon buttons, text links, and CTAs.

It exists to keep spacing, alignment, nowrap behavior, and constrained-width
compaction consistent when a parent layout gives the cluster limited space.

## Public Contract

- `align?: "start" | "end"`
- `gap?: "none" | "xs" | "sm" | "md"`
- `class?: string`
- default slot for action children

The component should stay layout-only. It should not know whether children are
search, theme, support, navigation links, or article actions.

## Composition Relationships

```text
PriorityInlineRow
  start slot
    ActionCluster align="start"
      icon/button/link children
  end slot
    ActionCluster align="end"
      nav/support children
```

Other components can use `ActionCluster` wherever inline controls need one-line
alignment without bespoke gap and shrink behavior.

## Layout Contract

`ActionCluster` uses `inline-flex`, `items-center`, `flex-nowrap`, and
`min-w-0`. The cluster aligns its children to the requested side and allows the
cluster box to shrink inside a parent track.

Children remain responsible for their own minimum useful size. Text children
that can truncate must opt into truncation deliberately; icon controls normally
keep fixed square hit targets.

## Responsive Behavior

The cluster exposes consistent gap variants. Parent components may pass
container-query classes for contextual compaction, but the cluster should avoid
viewport-specific product decisions.

For header use:

- the start cluster stays left-aligned;
- the end cluster stays right-aligned;
- both shrink inside side tracks before the centered brand changes size;
- the cluster never wraps onto a second line inside the primary header row.

## Accessibility Semantics

`ActionCluster` does not add roles. Children keep native link/button semantics
and focus states. The cluster must not hide focus outlines or use overflow in a
way that clips visible focus rings in normal states.

## Testable Invariants

- renders children in source order;
- applies start/end alignment predictably;
- stays one line unless a parent explicitly allows wrapping;
- can shrink inside `PriorityInlineRow` without causing overlap;
- preserves child focus visibility.

## Critical Review

This component should stay boring. If it grows product-specific props such as
`supportMode`, `header`, or `mobile`, those concerns belong in the parent
composition. Its value is making the common one-line action group contract hard
to forget.
