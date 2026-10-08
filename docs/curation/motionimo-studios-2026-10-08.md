# Motionimo studio curation — 2026-10-08

Source: [Motionimo Studios](https://motionimo.xyz/studios), 126 rendered studio cards checked on 2026-10-08.

## Result

- 54 entries matched an existing canonical studio; no duplicate records were created.
- 72 new studio records were added, including one corrected studio identity behind a resource website.
- 64 new records have manually inspected 1440×900 WebP captures and are eligible for directory display.
- 8 new records remain unpublished because their official sites could not be verified or rendered.
- No project/case-study records were inferred or imported in this studio-only pass.
- The source snapshot and exact agency mappings are preserved in `tests/fixtures/motionimo-studios.json`.

Validation: 37 tests passed across 5 files; `pnpm check` reported no errors or warnings; all 1,436 published screenshots passed dimension/format validation; `pnpm build` generated 1,440 pages successfully (with a non-blocking bundle-size warning). New IDs, slugs and domains are unique. No commit or push was performed.

## Identity and URL corrections

- Landscape (`thisislandscape.com`) is a separate studio from Lance (`lancedraws.com`). Removed the erroneous Landscape alias from Lance.
- State Design is verified at [statedesign.tv](https://statedesign.tv/) rather than the directory's inaccessible `statedesign.co` link.
- Walk A Thought's directory link omitted its protocol. Verified [walkathought.com](https://walkathought.com/).
- Alias's directory shortlink leads to a font marketplace, not its own studio. The official domain listed by [Typecache](https://typecache.com/Alias/) is `alias.dj`, but neither the HTTPS certificate nor HTTP endpoint was usable. Kept unpublished, without invented metadata.
- [Workbench's About page](https://workbench.tv/about/) identifies it as a training/tools resource run by the team behind [Yellow Dog Party](https://www.yellowdogparty.com/work). Added the actual animation studio, not the resource site as a studio.
- MetaLab and Two Times Elliott already exist under their known canonical identities; alternate/legacy directory domains did not create new records.
- Christopher Doyle & Co matches existing Christopher Doyle by domain; Workbyworks matches existing record `wonderworks` by its `workbyworks.studio` domain. Neither was duplicated.
- Fold's listed domain could not be reached. A possible alternative on its own LinkedIn profile also failed certificate verification, so no unverified domain migration was applied.

## Capture review

Ego Lite supplied the rendered directory and official-page metadata. Repeated screenshot timeouts required a fallback to the repository's Playwright/Sharp capture stack. Early captures with uncertain tab associations were discarded; only independently captured and visually inspected images were copied into the repository.

Most captures use the official homepage. For Landscape, Sociotype and Walk A Thought, their official Profile/About/Info pages provided verified visible content when the homepage remained empty. Øyedrops uses the portfolio section of its homepage rather than its stalled video hero. These final URLs are recorded in the screenshot manifest. Blank pages, loaders, TLS errors, upstream errors and the Kaboom domain-sale page were not approved.

## Unpublished records

| Studio | Listed or resolved website | Reason |
| --- | --- | --- |
| Alias | http://alias.dj/ | Official site could not be verified: HTTPS certificate error and HTTP 500. |
| Blind | https://blind.com/studio/ | Official site timed out at both the studio page and homepage. |
| Fold | https://www.foldstudio.co/ | The listed domain could not be reached; a possible replacement also has a certificate error. |
| Kaboom | https://www.kaboomhq.com/ | The listed domain redirects to a GoDaddy domain-for-sale page. |
| Ordinal | https://ordinal.studio/ | Official site could not be reached: HTTPS TLS error and HTTP 502. |
| Pan Studio | https://pan-motion.com/ | Official site could not be reached: connection closed and HTTP 502. |
| Rojocaballo | https://rojocaballo.com/ | Official site could not be reached: connection closed and HTTP 502. |
| Vectar | https://www.vectar.agency/ | Official site could not be reached: connection closed and HTTP 502. |

These records intentionally have empty descriptions and no locations where current official metadata could not be verified. They remain in the source catalogue with failed capture status, and the published directory excludes them.

Two already-existing source matches, An Open Understanding and Multi Form, also had failed screenshot status before this import. Their existing records and statuses were left unchanged.

## Newly added records

| Source name | Canonical studio | Official website | Capture |
| --- | --- | --- | --- |
| A Practice For Everyday Life | A Practice for Everyday Life | [apracticeforeverydaylife.com](https://apracticeforeverydaylife.com/) | Reviewed |
| Actual Source | Actual Source | [actualsource.work](https://actualsource.work/) | Reviewed |
| Alias | Alias | [alias.dj](http://alias.dj/) | Unpublished |
| All Purpose | All Purpose | [allpurpose.studio](https://allpurpose.studio/) | Reviewed |
| Atelier Dyakova | Atelier Dyakova | [atelierdyakova.com](https://atelierdyakova.com/) | Reviewed |
| Ateljé Altmann | Ateljé Altmann | [ateljealtmann.com](https://ateljealtmann.com/) | Reviewed |
| Base Design | Base Design | [basedesign.com](https://www.basedesign.com/) | Reviewed |
| Blind | Blind | [blind.com](https://blind.com/studio/) | Unpublished |
| Bold Decisions | Bold Decisions | [bold-decisions.biz](https://bold-decisions.biz/) | Reviewed |
| Boz Art | Boz Art | [bozart.se](https://www.bozart.se/) | Reviewed |
| Brand New School | Brand New School | [brandnewschool.com](https://www.brandnewschool.com/) | Reviewed |
| British Standard Type | British Standard Type | [britishstandardtype.xyz](https://www.britishstandardtype.xyz/) | Reviewed |
| Buff Motion | Buff Motion | [buffmotion.com](https://www.buffmotion.com/) | Reviewed |
| Bureau Antoine Roux | Bureau Antoine Roux | [bureauantoineroux.com](https://bureauantoineroux.com/) | Reviewed |
| Commercial Type | Commercial Type | [commercialtype.com](https://commercialtype.com/) | Reviewed |
| Daniel Carlsten | Daniel Carlsten | [danielcarlsten.com](https://www.danielcarlsten.com/) | Reviewed |
| Dedouze | Dédouze | [dedouze.com](https://dedouze.com/) | Reviewed |
| Dinamo | Dinamo | [abcdinamo.com](https://abcdinamo.com/) | Reviewed |
| Displaay | Displaay | [displaay.net](https://displaay.net/) | Reviewed |
| Dissembargo | DissEmbargo | [dissembargo.com](https://www.dissembargo.com/) | Reviewed |
| Eastern Rodeo | Eastern Rodeo | [easternrodeo.co](https://easternrodeo.co/) | Reviewed |
| edition.studio | edition.studio | [edition.studio](https://edition.studio/) | Reviewed |
| Elodie Fabbri | Elodie Fabbri | [elodiefabbri.com](https://elodiefabbri.com/) | Reviewed |
| Fold | Fold | [foldstudio.co](https://www.foldstudio.co/) | Unpublished |
| Formula Type | Formula Type | [formulatype.com](https://formulatype.com/) | Reviewed |
| FROST | FROST | [frostype.xyz](https://www.frostype.xyz/) | Reviewed |
| Garrett Elizabeth Office / G.E.O. | Garrett Elizabeth Office | [geo-nyc.com](https://geo-nyc.com/) | Reviewed |
| Get It Studio | Get It Studio | [get-it.studio](https://get-it.studio/) | Reviewed |
| Giant Ant | Giant Ant | [giantant.ca](https://www.giantant.ca/) | Reviewed |
| Goldenwolf | Golden Wolf | [goldenwolf.tv](https://www.goldenwolf.tv/) | Reviewed |
| Grace Margetson Studio | Grace Margetson Studio | [gracemargetsonstudio.com](https://www.gracemargetsonstudio.com/) | Reviewed |
| Haw-lin Services | Haw-lin Services | [haw-lin-services.com](https://haw-lin-services.com/) | Reviewed |
| HB Type | HB Type | [hbtype.com](https://www.hbtype.com/) | Reviewed |
| Hobbes | Hobbes | [hobbes.work](https://www.hobbes.work/) | Reviewed |
| Jordi van der Oord | Jordi van der Oord | [jordivanderoord.com](https://jordivanderoord.com/) | Reviewed |
| Kaboom | Kaboom | [kaboomhq.com](https://www.kaboomhq.com/) | Unpublished |
| Landscape | Landscape | [thisislandscape.com](https://thisislandscape.com/) | Reviewed |
| Lotta Nieminen | Lotta Nieminen | [lottanieminen.com](https://www.lottanieminen.com/) | Reviewed |
| M. Giesser | M. Giesser | [mgiesser.com](https://www.mgiesser.com/) | Reviewed |
| Noodle | Noodle | [noodleanimation.com](https://www.noodleanimation.com/) | Reviewed |
| Ordinal | Ordinal | [ordinal.studio](https://ordinal.studio/) | Unpublished |
| Oyedrops | Øyedrops | [oyedrops.studio](https://www.oyedrops.studio/) | Reviewed |
| Pan Studio | Pan Studio | [pan-motion.com](https://pan-motion.com/) | Unpublished |
| Pixar | Pixar Animation Studios | [pixar.com](https://www.pixar.com/) | Reviewed |
| Playd | Playd | [playd.studio](https://www.playd.studio/) | Reviewed |
| Psyop | Psyop | [psyop.com](https://psyop.com/) | Reviewed |
| Public Image | Public Image | [public-image.co](https://public-image.co/) | Reviewed |
| Regular Practice | Regular Practice | [regularpractice.co.uk](https://regularpractice.co.uk/) | Reviewed |
| République Studio | République Studio | [republique.studio](https://www.republique.studio/) | Reviewed |
| Rojocaballo | Rojocaballo | [rojocaballo.com](https://rojocaballo.com/) | Unpublished |
| Schick Toikka | Schick Toikka | [schick-toikka.com](https://www.schick-toikka.com/) | Reviewed |
| Services Généraux | Services Généraux | [generaux.services](https://generaux.services/) | Reviewed |
| Sharp Type | Sharp Type | [sharptype.co](https://www.sharptype.co/) | Reviewed |
| SM Type Foundry | SM Type Foundry | [s-m.nu](https://s-m.nu/) | Reviewed |
| Sociotype | Sociotype | [socio-type.com](https://socio-type.com/) | Reviewed |
| State Design | State Design | [statedesign.tv](https://statedesign.tv/) | Reviewed |
| Steelworks | Steelworks | [steelworks.studio](https://www.steelworks.studio/) | Reviewed |
| Studio Albin Holmqvist | Studio Albin Holmqvist | [studioalbinholmqvist.com](https://studioalbinholmqvist.com/) | Reviewed |
| Studio Furore | Studio Furore | [studiofurore.at](https://studiofurore.at/) | Reviewed |
| STUDIO WAN | STUDIO WAN | [studiowan.uk](https://www.studiowan.uk/) | Reviewed |
| Tactyc | Tactyc | [tactyc.studio](https://www.tactyc.studio/) | Reviewed |
| The Company You Keep | The Company You Keep | [tcyk.com.au](https://www.tcyk.com.au/) | Reviewed |
| The Furrow | The Furrow | [thefurrow.tv](https://thefurrow.tv/) | Reviewed |
| The Mill | The Mill | [themill.com](https://www.themill.com/) | Reviewed |
| The Rocket Panda | Rocketpanda | [therocketpanda.com](https://www.therocketpanda.com/) | Reviewed |
| Tino Nyman | Tino Nyman | [tinonyman.com](https://tinonyman.com/) | Reviewed |
| Turnislefthome | Turnislefthome | [turnislefthome.com](https://turnislefthome.com/) | Reviewed |
| Vectar | Vectar | [vectar.agency](https://www.vectar.agency/) | Unpublished |
| Walk A Thought | Walk A Thought | [walkathought.com](https://walkathought.com/) | Reviewed |
| Workbench | Yellow Dog Party | [yellowdogparty.com](https://www.yellowdogparty.com/work) | Reviewed |
| Zak Group | Zak Group | [zak.group](https://www.zak.group/) | Reviewed |
| Zunc | Zünc | [zunc.studio](https://www.zunc.studio/) | Reviewed |
