# Longlist studio curation — 2026-10-18

Source: [Longlist Studios](https://longlist.design/?kind=studio), reconciled against its public [pages sitemap](https://longlist.design/pages.xml). All 978 studio profiles were retrieved, not only the 96 initial cards. The separately classified 275 designer profiles were outside this studio-only pass.

## Result

- 978 source profiles resolve to 968 unique studio identities after canonical-domain and mirror checks.
- 370 unique studios were already represented; 598 new records were added.
- 581 new studios have visually reviewed official-site previews and are eligible for display.
- 17 new records remain unpublished pending a usable, verified preview. Four previously unpublished existing records also remain held.
- 10 existing studios recovered successful previews: brenden, bruno, off-brand, maven-creative, multi-form, refokus, studio-ongarato, the-woork-co, check, mucho.
- 600 previews were copied into the repository: 581 for new records and 19 replacements or recoveries for existing identities.
- Catalog total: 2,211 records; published total: 2,030.
- Nine existing records retain their IDs and slugs but use verified current website domains.
- The pre-existing Sunday, Saxon Campbell and Maria Vareva JSON/manifest entries and images were preserved. No case-study data or UI components were changed.
- Full source-to-record mappings are in `tests/fixtures/longlist-studios.json`. No commit, push or deployment was performed.

## Canonical identity checks

Verified domain migrations: Alex Hunting Studio, Brand Brothers, Bruno, Forsman & Bodenfors, Manual, No Plans, Only, Tendril and The Woork. Alex Hunting Studio's current Denmark registration also replaces its outdated London description/location. Existing IDs remain stable despite domain migrations.

- [Alex Hunting Studio privacy policy](https://alexhunting.studio/pages/privacy-policy) supplies its current Denmark details and former-domain contact evidence.
- [Bruno legal notice](https://www.bruno.co/us/legal-notice) connects the current domain with the former callbruno.com contact.
- The old Brand Brothers, Forsman & Bodenfors, Manual, No Plans, Only and Tendril websites redirect to their current domains.
- The Woork's current site and former identity share the Madrid address and phone numbers.
- DIA and SKINN redirect to domains already present in the catalog. GrandArmy's hyphenated directory link has a certificate mismatch; it maps to the existing, valid grandarmy.com identity rather than adding a broken duplicate.

Mirrors merged into one new identity each:

- Andstudio: andstudio.lt and byandstudio.com. The [official contact page](https://byandstudio.com/contact/) retains the andstudio.lt email.
- New Material: newmaterial.co and newmaterial.ai render the same business and identify newmaterial.ai as canonical.
- Kontrapunkt: kontrapunkt.dk and kontrapunkt.com. Its [official B Corp article](https://kontrapunkt.com/journal/b-corp-certification) links the older .dk domain.
- F&B Happy: happy.fb.se redirects to happy.forsman.com. Its [official work portfolio](https://happy.forsman.com/work/) and [credited identity project](https://happy.forsman.com/work/a-forward-leaning-identity/) distinguish this branding practice from the parent collective.
- Primary Works: primaryworks.com.au redirects to primary.works.

Homonyms were not merged: BAM / BAM Lab, Bone Studio / Bone Digital, Frost* / FROST type foundry, Landscape Productions / Landscape, Off–Brand / OFF+BRAND, Off-Menu / Off Menu, Watson NYC / Watson LA, Modem Works / Modem Studio, Anagram Club / ANAGRAM, and the separate Ensemble and Wednesday practices.

## Preview approach

Longlist uses wide, cover-led studio cards (approximately 40:21). This import follows that emphasis on visible official work while preserving studio.list's existing 1440×900 WebP capture contract and card layout. Longlist-hosted covers were not copied.

Ego Lite supplied the rendered directory and metadata. Its screenshot wrapper repeatedly timed out, so captures used the repository's Playwright/Sharp stack, with an isolated page per studio. First-pass contact sheets, 108 targeted retries and 35 additional checks/fallbacks were visually reviewed. Blank pages, unresolved loaders, challenges, unrelated redirects and severe consent overlays were not published. Minimal but genuine typographic homepages were retained.

Where the homepage hero did not render, actual official Work/About pages or a portfolio viewport were used; the final URL and scroll offset (where applicable) are retained in the manifest. Examples:

- 20something: [https://www.20-something.com/work](https://www.20-something.com/work)
- anagram-club: [https://www.anagram.club/about](https://www.anagram.club/about)
- brainchild: [https://brnchd.com/studio](https://brnchd.com/studio)
- cartlidge-levene: [https://cartlidgelevene.co.uk/work/category/selected](https://cartlidgelevene.co.uk/work/category/selected)
- combo: [https://combo.co/projects](https://combo.co/projects)
- fiasco: [https://fiasco.design/work/](https://fiasco.design/work/)
- monga-d: [https://monga.design/about/](https://monga.design/about/)
- luke-robertson-studio: [https://lukerobertson.studio/](https://lukerobertson.studio/) (homepage portfolio viewport, scrollY=850)
- lukecharles: [https://www.lukecharles.com/work/mnd-association/](https://www.lukecharles.com/work/mnd-association/)
- hornet: [https://www.hellohornet.com/about](https://www.hellohornet.com/about)
- cru: [https://www.madebycru.com/work/branding-b2c-fintech-onlinebroker-traderepublic](https://www.madebycru.com/work/branding-b2c-fintech-onlinebroker-traderepublic)
- the-matchbox-studio: [https://matchboxstudio.com/work/](https://matchboxstudio.com/work/)
- melody-digital: [https://melodydigital.co/about](https://melodydigital.co/about)
- rob-en-robin: [https://robenrobin.nl/about/](https://robenrobin.nl/about/)
- retinaa: [https://retinaa.ch/](https://retinaa.ch/) (homepage portfolio viewport, scrollY=850)
- program-studio: [https://program.studio/work/adg-fad-laus/](https://program.studio/work/adg-fad-laus/)
- refokus: [https://www.refokus.com/work](https://www.refokus.com/work)
- f-and-b-happy: [https://happy.forsman.com/work/](https://happy.forsman.com/work/)

Descriptions use official-page metadata or short, source-backed practice categories; no biographies, clients or case-study URLs were invented. Locations are retained only when the listed country or city is corroborated on the official page. Unverified-site records have no invented description or location.

Country assets use the existing flag-icons 4:3 source. Fourteen missing SVGs were added, including three previously missing existing-country assets (EE, KE, NP), with the upstream MIT notice retained in `public/flags/LICENSE.txt`.

## Held records

| Studio | Website | Record | Reason |
| --- | --- | --- | --- |
| Agent Pekka | [https://agentpekka.com/](https://agentpekka.com/) | Existing | Cloudflare 403 challenge. |
| Calame.Bureau | [https://www.arthurcalame.com/](https://www.arthurcalame.com/) | New | Homepage and portfolio navigation remain on the introductory logo. |
| Atla | [https://atla.design/](https://atla.design/) | New | Deployment paused (HTTP 402). |
| Codeam | [https://codeam.nl/](https://codeam.nl/) | New | Official homepage is a coming-back-soon notice. |
| Estúdio Gole | [https://estudiogole.com/en-us/](https://estudiogole.com/en-us/) | New | Portfolio thumbnails remain black after homepage and work-page retries. |
| GoodLove | [https://goodlove.co](https://goodlove.co) | New | Cloudflare 403 challenge. |
| Hello Comrade | [https://hellocomradestudio.com/](https://hellocomradestudio.com/) | New | The listed domain redirects to Google, not an official studio page; the unrelated screenshot was rejected. |
| Houston Group | [https://houstongroup.com.au/](https://houstongroup.com.au/) | New | A full-screen introductory panel obscures the website. |
| JOAN | [https://joan-design.com/](https://joan-design.com/) | New | Cloudflare 403 challenge. |
| Lusion | [https://lusion.co/](https://lusion.co/) | Existing | WebGL introduction remains at the loader. |
| Morcos Key | [https://morcoskey.com/](https://morcoskey.com/) | New | Video does not render; navigation and fallback pages remain mostly blank. |
| STUDIO OKGO | [https://okgocorp.com/](https://okgocorp.com/) | New | Animated introductory mark does not progress to portfolio content. |
| Over-Stimulated | [https://www.over-stimulated.com/](https://www.over-stimulated.com/) | New | Blank / holding-page capture after repeated attempts. |
| Poster | [https://posterco.tv/](https://posterco.tv/) | New | Initial blurred frame; official fallback returns HTTP 429. |
| Silk Service | [https://www.silkservice.berlin/](https://www.silkservice.berlin/) | New | Cookie consent panel continues to obscure the work. |
| Something Special Studios | [https://somethingspecialstudios.com](https://somethingspecialstudios.com) | New | Cloudflare 403 challenge. |
| Studio K | [https://studiok.co/](https://studiok.co/) | New | Blank or introductory mark only. |
| TRIANGLE-STUDIO | [http://www.triangle-studio.co.kr/](http://www.triangle-studio.co.kr/) | New | Blank HTTP homepage after retries; HTTPS was not substituted for the listed HTTP URL. |
| UNVEIL | [https://unveil.fr/](https://unveil.fr/) | Existing | Deployment paused (HTTP 402). |
| Village Green | [https://villagegreen.studio/](https://villagegreen.studio/) | New | Blank / black capture after homepage and fallback attempts. |
| Motto | [https://wearemotto.com/](https://wearemotto.com/) | Existing | Cloudflare 403 challenge. |

## Validation

- 43 tests passed across six files, including 978-profile coverage, mirror/homonym handling, unique canonical identity, country assets, publication gating and unrelated-redirect rejection.
- Astro check: 0 errors, warnings or hints.
- All 2,030 published images validated as 1440×900 WebP.
- Build: 2,034 pages generated; existing non-blocking bundle-size warning remains.
- `git diff --check` passed.
- Pre-existing local additions were compared with the pre-import snapshots and remained unchanged.

