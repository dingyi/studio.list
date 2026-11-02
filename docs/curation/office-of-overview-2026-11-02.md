# Office of Overview curation — 2026-11-02

Official sources: [homepage](https://officeofoverview.com/) and [Work](https://officeofoverview.com/work), inspected in ego lite after client rendering completed.

## Agency identity

The catalog already contains one published Agency for `officeofoverview.com`: Office of Overview, slug `office-of-overview`, ID `972cc313515ef247`. Its source-provided description remains current: “Overview is a strategy and brand office helping frontier companies make unorthodox futures familiar, credible and desirable.” The official footer gives a London address at 205, Mare Street Studios, 203–213 Mare St, London E8 3JS, confirming the existing United Kingdom location.

The Agency record and its existing reviewed 1440×900 homepage screenshot are retained. No duplicate Agency was added.

## Added Case Studies

The live Work page contains 11 project cards. Five link to published case pages with project descriptions, credits and media:

| Project | Official source |
| --- | --- |
| Odin | https://officeofoverview.com/work/odin |
| Curate | https://officeofoverview.com/work/curate |
| Human | https://officeofoverview.com/work/human |
| Fermat | https://officeofoverview.com/work/fermat |
| 23° | https://officeofoverview.com/work/23-degrees |

All five were captured directly in ego lite at 1440×900, scroll position 0, then encoded as WebP. The hero videos were allowed to load and paused on rendered frames before capture. No generated artwork, replacement media, hotlinked thumbnails or overlays were used. The images were visually reviewed; viewport and video-frame provenance are recorded per URL-derived Case Study ID in `case-study-manifest.json`.

## Unpublished cards

Waterside, Kito, Swan, Spektr, Good Phats and Manner display “Coming soon” and have no active case-page link after client rendering. They are excluded from the runtime Case Study catalog. The initial server-rendered markup briefly exposes some additional links; the settled live page, rather than those stale links, determines the published set. Client websites and press links are not substituted for unpublished cases.

## Scope

Only the five new Case Studies, their capture manifest entry, local images and this provenance note belong to this addition. Existing Agency data, the Agency screenshot manifest and all unrelated Case Studies remain unchanged from the pre-import snapshot. The earlier local Lirona addition is preserved. No commit, push or deployment was performed.

## Validation

- All 81 existing tests passed across 10 files.
- Astro check completed with 0 errors, warnings or hints.
- Static build generated 2,037 pages successfully; the existing non-blocking bundle-size warning remains.
- Direct data checks verified the exact five published source URLs, unique URL-derived IDs, the source-set hash and all five images as 1440×900 WebP.
- Pre-import comparisons confirmed unchanged Agency data and screenshot manifest, plus unchanged unrelated Case Study records and manifest entries.
- The local Agency detail and Work page were checked in ego lite. All five new card images loaded and all five links point to the verified official cases; default and hover link text have no underline.
- `git diff --check` passed.
