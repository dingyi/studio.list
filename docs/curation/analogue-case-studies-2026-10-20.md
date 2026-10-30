# Analogue complete portfolio curation — 2026-10-20

Sources: [official work overview](https://analogueagency.com/cases-overview), [public sitemap](https://analogueagency.com/sitemap.xml), and the linked official case pages.

## Result

- Reused the existing Analogue Agency identity (`3802799ed9fef8e8`, `analogue-agency`, `analogueagency.com`), without creating a duplicate. Its description now uses the current official homepage's first metadata sentence; the Netherlands location is corroborated by its Amsterdam address.
- The overview has 39 project cards: 30 internal case links, one official product-site link and eight WIP cards without detail links.
- The sitemap has one additional case path, North Sails, but its visible page only says Coming Soon. It is not treated as a published case, despite having a case-shaped URL and SEO description.
- Added 30 new Case Studies, retained the existing Vitra entry and its unchanged 1440×900 capture, and removed the wrongly classified Outcomes About page. Analogue now has 31 published Case Studies.
- Captured the official aF-1 destination because it is explicitly linked as a project on the overview; no separate Agency was inferred from the shop domain.
- All eight WIP cards and the North Sails placeholder are accounted for in `tests/fixtures/analogue-case-studies.json`; no guessed URLs or placeholder thumbnails were published.
- The homepage, overview and case sources were read using ego-browser. Its screenshot request timed out, so captures used the project's Playwright/Sharp stack. Every new 1440×900 WebP was visually inspected; CDI was recaptured after its animated hero had progressed.
- The generic case-link extractor now excludes `/about-us/*` pages, with a regression test for Outcomes/Expertise/Team. The generic capture script's six-entry default was not used for this complete, source-curated import.
- No other Agency/Case Study records or publication-manifest entries were changed. All earlier Longlist and individual-designer local changes were preserved.
- No commit, push or deployment was performed.

## Published Case Studies

| Project | Official source |
| --- | --- |
| Free The Youth × Jordan: Arena of Flight | [Source](https://analogueagency.com/case/fty) |
| Vitra | [Source](https://analogueagency.com/case/vitra) |
| Menkind | [Source](https://analogueagency.com/case/menkind) |
| M1 Capital | [Source](https://analogueagency.com/case/m1capital) |
| Atomic Bootfinder | [Source](https://analogueagency.com/case/bootfinder) |
| Erwin Olaf Magazine | [Source](https://analogueagency.com/case/erwinolafmagazine) |
| ILGM | [Source](https://analogueagency.com/case/ilgm) |
| BSTRD | [Source](https://analogueagency.com/case/bstrd) |
| UPC Renewables | [Source](https://analogueagency.com/case/upc) |
| CDI | [Source](https://analogueagency.com/case/cdi) |
| Guiker | [Source](https://analogueagency.com/case/guiker) |
| TravelTeq | [Source](https://analogueagency.com/case/travelteq) |
| Tony's Chocolonely | [Source](https://analogueagency.com/case/tonyschocolonely) |
| Analogue aF-1 | [Source](https://af1.analogueshop.com/) |
| Fyron | [Source](https://analogueagency.com/case/fyron) |
| THE➊ | [Source](https://analogueagency.com/case/the1) |
| APF | [Source](https://analogueagency.com/case/apf) |
| Ask Phill | [Source](https://analogueagency.com/case/askphill) |
| Atomic | [Source](https://analogueagency.com/case/atomic) |
| Boldking | [Source](https://analogueagency.com/case/boldking) |
| Maven 11 | [Source](https://analogueagency.com/case/maven) |
| Rekorder | [Source](https://analogueagency.com/case/rekorder) |
| Equip | [Source](https://analogueagency.com/case/equip) |
| Lova | [Source](https://analogueagency.com/case/lova) |
| D2C Summit | [Source](https://analogueagency.com/case/d2csummit) |
| Nucatus | [Source](https://analogueagency.com/case/nucatus) |
| Oratio | [Source](https://analogueagency.com/case/oratio) |
| The Youturn | [Source](https://analogueagency.com/case/theyouturn) |
| Artis | [Source](https://analogueagency.com/case/artis) |
| Conway & Co | [Source](https://analogueagency.com/case/conway) |
| Stories | [Source](https://analogueagency.com/case/stories) |

## Unpublished source projects

| Project | Reason |
| --- | --- |
| Honeybalm | Official WIP card has no published detail URL. |
| Jitter | Official WIP card has no published detail URL. |
| ManvsMachine | Official WIP card has no published detail URL. |
| Polaroid | Official WIP card has no published detail URL. |
| FC Hyena | Official WIP card has no published detail URL. |
| Leica | Official WIP card has no published detail URL. |
| OFYR | Official WIP card has no published detail URL. |
| Synchroon | Official WIP card has no published detail URL. |
| North Sails | Official sitemap page only shows Coming Soon; no published case content. |

These projects remain in the source audit, not the runtime Case Study catalog. There is no published detail URL for the eight WIP cards. North Sails is explicitly a Coming Soon page, not a complete case.

## Removed incorrect record

`https://analogueagency.com/about-us/outcomes` is an Agency About page, not a project. Its Case Study entry was removed. The old tracked thumbnail remains unreferenced on disk; no unrelated or historical assets were deleted.

## Validation

- 48 tests passed across seven files, covering the complete published set, WIP exclusions, stable Agency identity, URL-derived case IDs, source hash, the verified product link and every image's dimensions/format.
- Astro check: 0 errors, warnings or hints.
- Static build: 2,034 pages generated; the non-blocking bundle-size warning remains.
- `git diff --check` passed.
- Compared pre-import snapshots: all unrelated Agency records, Case Study records, case-manifest entries and the entire Agency screenshot manifest are unchanged.

