---
title: Building XR User Interfaces
date: 2026-06-24
readingMinutes: 6
summary: Lessons on designing UI that stays readable and comfortable inside a headset.
tags: [xr, unity, ui]
---

# Building XR User Interfaces

Designing UI for XR is nothing like designing for a 2D screen. In a headset, text
has real physical size, panels occupy real space, and the user's neck is a limited
resource. Here is what I keep coming back to.

## Keep it in the comfortable field of view

Anything the user must read should sit within roughly a 30° cone in front of them.
Push content to the periphery and people miss it — or worse, strain to find it.

## Diegetic beats floating

Whenever possible I anchor UI to objects in the world: a control panel on a machine,
a tablet the user holds. It grounds the interface and removes the "menu floating in
the void" feeling.

## Size text generously

- Use physically large fonts (a good rule: **at least 1° of visual angle per glyph**).
- Prefer high contrast; subtle grays vanish on standalone displays.
- Avoid thin fonts — they shimmer under headset reprojection.

## Test on the actual device

Editor previews lie. Something that looks perfect on a monitor can be unreadable or
nauseating in a headset. Build to device early and often.

> The best XR UI is the one users never consciously notice — it just works.
