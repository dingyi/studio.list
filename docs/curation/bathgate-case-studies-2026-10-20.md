# Bathgate complete portfolio curation — 2026-10-20

Sources: [official Work page](https://bathgate.design/work), both Grid and Index views, and the [public sitemap](https://bathgate.design/sitemap.xml).

## Result

- Bathgate Design was already present as `bathgate-design`, ID `2d88c6cc871718ce`, official domain `bathgate.design`. Its existing description, New Zealand location and Agency Screenshot remain unchanged. The [Contact page](https://bathgate.design/contact) confirms Christchurch, New Zealand.
- Grid, Index and sitemap agree on the same 14 project URLs. Repeated links between views were deduplicated by canonical URL. There were no missing sitemap-only projects, pagination links or WIP placeholders.
- All 14 projects were missing from the Case Study catalog and have now been added with their source-provided titles and authentic 1440×900 WebP previews.
- Every detail page returned valid official content on the expected domain. All previews were visually reviewed.
- Ego-browser supplied the rendered source list, Index check, sitemap and official location evidence. Captures used the existing Playwright/Sharp workflow after the Ego screenshot timeout established in the immediately preceding portfolio task.
- These case pages introduce the project in text before showing its media. The curated thumbnails deliberately use the actual first-project-media viewport rather than a mostly white introductory screen. This is a per-source preview exception, not a change to the global capture defaults. No image was synthesized, hotlinked or extracted as a replacement screenshot. The final page URL, media top and actual scroll position are recorded per Case Study ID in the case manifest's `captureViewports` field.
- No existing Agency data, Agency screenshot status, unrelated Case Studies or unrelated case-manifest entries were changed. Earlier Longlist and Analogue local changes are preserved.
- No commit, push or deployment was performed.

## Added Case Studies

| Project | Official source |
| --- | --- |
| Two Raw Sisters | [Source](https://bathgate.design/work/two-raw-sisters) |
| Good Carm | [Source](https://bathgate.design/work/good-carm) |
| Alex Fulton | [Source](https://bathgate.design/work/alex-fulton) |
| Ōtautahi Made | [Source](https://bathgate.design/work/otautahi-made) |
| Hellzapoppin'!: The Art of Flying Nun | [Source](https://bathgate.design/work/hellzapoppin) |
| Hughes | [Source](https://bathgate.design/work/hughes) |
| Estelle Catering | [Source](https://bathgate.design/work/estelle) |
| C1 Espresso | [Source](https://bathgate.design/work/c1-espresso) |
| Tall Dwarfs 'Unravelled' | [Source](https://bathgate.design/work/tall-dwarfs) |
| Qb Studios | [Source](https://bathgate.design/work/qb-studios) |
| Christchurch Art Gallery Foundation | [Source](https://bathgate.design/work/cagf) |
| Arbor Green | [Source](https://bathgate.design/work/arbor-green) |
| Arbor Green Campaign | [Source](https://bathgate.design/work/ag-campaign) |
| Actually | [Source](https://bathgate.design/work/actually) |

## Validation

- 52 tests passed across eight files, including full 14-project coverage, stable Agency identity, URL-derived IDs, deduplication, complete source hash, capture provenance and all image dimensions/formats.
- Astro check: 0 errors, warnings or hints.
- Static build: 2,034 pages generated; the existing non-blocking bundle-size warning remains.
- `git diff --check` passed.
- Pre-import snapshots confirm that all unrelated Case Studies and case-manifest entries, and the entire Agency data and screenshot manifest, remain unchanged.

