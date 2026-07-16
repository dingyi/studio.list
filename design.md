# studio.list Design Specification

Status: implemented MVP specification, with navigation, search, and About page interaction patterns adapted from Design Engineer Club.

## Reference

The visual system is based directly on [Curated Supply](https://www.curated.supply/), inspected on 2026-07-15 at desktop and mobile widths. studio.list should feel like the same restrained, product-led directory adapted to design agencies rather than a generic SaaS interface.

Reference qualities to preserve:

- a quiet `#f2f2f2` canvas with white content surfaces;
- Geist typography, dark neutral text, and generous whitespace;
- centered editorial hero copy;
- compact pill-shaped navigation, filters, and actions;
- large, image-led cards with no shadow;
- a sparse index/list view with small thumbnails and generous rows;
- soft 16px card corners and fully rounded controls;
- responsive reduction from three columns to one without changing the visual language.

Do not copy Curated Supply's product content, branding, star mark, newsletter, category taxonomy, or commerce language.

## Product Translation

| Curated Supply pattern | studio.list use                        |
| ---------------------- | -------------------------------------- |
| Product                | Agency                                 |
| Product image          | Agency Screenshot                      |
| Brand · Category       | Location                               |
| Product name           | Agency name                            |
| Purchase link          | Official Website Action                |
| Product page           | Agency Detail                          |
| Discover grid          | Card view                              |
| Index                  | List view                              |
| Category pills         | Country filter and active search state |

## Content language

- The MVP interface is English only.
- Do not add a language switcher or machine-translated Agency content.
- Keep interface copy concise and sentence case to preserve the reference site's typographic rhythm.
- Agency names retain their original script and capitalization even when they are not English.
- Agency Descriptions preserve the source wording and meaning; only malformed punctuation, quoting, and whitespace may be corrected.

## Foundations

### Color

Use neutral color tokens and let Agency Screenshots provide nearly all page color.

```css
--background: #f2f2f2;
--surface: #ffffff;
--surface-subtle: #f5f5f5;
--text: #141414;
--text-muted: #737373;
--border: #e2e2e2;
--border-strong: #cccccc;
--focus: #141414;
--status-success: #35d07f;
```

- No gradients.
- No decorative shadows on cards, navigation, filters, or screenshots.
- Use one-pixel borders only when a control needs separation from the background.
- The MVP is designed in light mode; no unconfirmed dark palette should be invented.

### Typography

Use `Geist Variable`, with `Geist, ui-sans-serif, system-ui, sans-serif` as the fallback stack.

| Role             | Desktop  | Mobile  | Treatment                                        |
| ---------------- | -------- | ------- | ------------------------------------------------ |
| Hero H1          | 54–112px | 49–74px | weight axis 480, tight display spacing, balanced |
| Detail/Page H1   | 42–74px  | 42–53px | weight axis 490, `-0.06em`, balanced             |
| Section H2       | 32/35px  | 28/31px | 500                                              |
| Card title       | 16/22px  | 16/22px | 450–500                                          |
| Body             | 16/24px  | 16/24px | 400                                              |
| Metadata/control | 14/20px  | 14/20px | 400                                              |
| Micro label      | 12/16px  | 12/16px | 450–500                                          |

- Use sentence case.
- Agency names retain their source capitalization.
- Use muted text for location and descriptions, never reduced opacity on the whole element.

### Spacing and shape

- Base spacing unit: 4px.
- Desktop page inset: 28–32px.
- Tablet page inset: 24px.
- Mobile page inset: 16px.
- Header height: 56px desktop and mobile.
- Card/grid gap: 12px desktop and mobile.
- Card radius: 16px.
- Screenshot inner radius: 8px.
- Pill/control radius: `999px`.
- Minimum interactive target: 44×44px; compact visible controls may be 36px only when their interactive wrapper remains at least 44px.

## Header

Desktop:

- use the Design Engineer Club three-part navigation rhythm within a 56px bar: wordmark and plain-text section links at left, search centered, and the primary action at right;
- primary navigation labels are `Discover` and `About`; `Submit` is the dark right-aligned action;
- transparent over the page canvas; no containing pill, bottom border, or shadow;
- the centered search trigger is 256×36px with a soft-gray fill, search icon, placeholder label, and `⌘ K` shortcut hint;
- active navigation remains understated through text tone rather than a filled pill.

Mobile:

- 56px bar with the `studio.list` wordmark at left and compact 36px search/menu actions at right;
- hide the centered desktop navigation inside the menu;
- preserve the quiet background and large tap targets.

The navigation includes a visible `Submit` action. In the MVP it opens a lightweight “Submissions are opening soon.” notice and does not display a form, save data, or trigger an external workflow. Do not add Blog or account links without approval.

Use no standalone logo symbol in the MVP and do not recreate Curated Supply's star mark.

The favicon uses a black Geist `s.` monogram on `--background`. It may also appear as a small share-image corner mark, but not as a standalone logo in page navigation.

## Home / Discover

### Hero

- Match the reference's centered, compact hero composition beneath the navigation.
- Keep the heading and supporting copy within a centered 540px column.
- Final heading: `Discover remarkable, independent design agencies`.
- Final supporting copy: `Subscribe for a weekly edit of remarkable studios shaping brands, products, and culture.`
- Include a 428×40px white pill newsletter field with an email input and `Subscribe` action. Until a newsletter backend is approved, submission opens a clear notice and does not store or transmit the address.

Desktop follows the reference measurements after omitting the reference status pill: the heading begins around 188px from the viewport top, uses 36px/39.6px type, and the catalog controls begin around 463px. Mobile uses the same 36px title, full-width newsletter field within 16px page insets, and places catalog controls around 450–470px.

### Catalog toolbar

The toolbar contains:

- a single-select country control;
- the card/list view switch;
- a compact result count;
- stable name ordering; no unconfirmed service filters.

Do not render a sort dropdown in the MVP. The source has no reliable featured, popularity, or publication-date signal, and an A–Z-only menu would add no value.

View selection precedence is: explicit `view` URL parameter, then the locally remembered preference, then card view for a first-time visitor. Changing the view updates both the URL and the remembered preference.

Controls use white active pills and transparent or outlined inactive pills. On mobile, controls may scroll horizontally in a single row; hide the scrollbar and preserve visible partial overflow as a cue.

### Card view

Responsive grid:

- desktop, `>= 1100px`: three equal columns;
- tablet, `700–1099px`: two equal columns;
- mobile, `< 700px`: one column;
- 16px gap at every size.

Card anatomy:

1. Transparent card structure with no containing panel, border, or shadow.
2. Main card link leading to Agency Detail.
3. A standalone 16:10 Agency Screenshot displayed completely, without crop, in a 15px-radius media frame.
4. Agency name below and outside the media frame.
5. Location metadata below the name in muted text.
6. Separate Official Website Action at the top right.

Do not display the Agency Description in card view. It belongs in list view and Agency Detail so card heights and visual density remain consistent with the reference.

Agency Location is formatted as an emoji flag plus English country name, such as `🇸🇪 Sweden`. Separate multiple locations with a middle dot and never rely on emoji alone.

Cards follow the Design Engineer Club course-card anatomy: the media is flush with the card grid, the external caption begins 12px below it, the Agency name uses 14px/20px semibold type, and location follows after 4px at 12px/16px. Use 20px column gaps and 40px row gaps. Do not add a containing background or shadow.

The external action is a 36px visible circle on `--surface-subtle`, inset 16px from the card with no shadow. It appears on pointer hover and keyboard focus. It remains visible on touch layouts. Activating it opens the official website in a new tab and must not trigger detail navigation.

Card hover should remain subtle: a small media scale or tonal change over 180–220ms is acceptable; the card must not jump, tilt, glow, or cast a shadow.

### Screenshot assets

- Store MVP screenshots as optimized WebP files under `public/screenshots`.
- Use stable relative paths in Agency data; do not embed remote screenshot-service URLs into page components.
- Keep the complete 1440×900 capture at its 16:10 ratio.
- Set explicit image width and height to prevent layout shift.
- A later CDN migration must be possible by changing the asset base rather than rewriting every component.

### List view

Follow the reference Index page rather than turning the list into bordered table rows.

Desktop row grid:

```text
thumbnail | agency name | location + short description | external action
```

- Row height: 72–88px.
- Screenshot thumbnail: 88×55px (16:10), 6–8px radius.
- No containing card, alternating background, heavy divider, or table header.
- Agency name is primary; location/description is muted; external arrow aligns to the far right.
- The row body opens Agency Detail; the arrow opens the official website.

Mobile rows reduce to thumbnail, a two-line text stack, and the external action. The screenshot remains present because every Published Agency must have an Agency Screenshot.

### Pagination

- Show 36 agencies per page.
- Place pagination below the grid/list with generous vertical separation.
- Use rounded white controls consistent with the header and filters.
- Current page is dark text on white; disabled directions use muted text.
- Preserve search, country, view, and page in the URL so a result view can be revisited or shared.
- Moving to another page returns focus to the results heading and scrolls the catalog start into view.

## Agency Detail

Use the reference product-detail composition, simplified for verified agency data.

Top section:

- circular back action at top left;
- centered studio.list navigation/mark;
- location metadata above the Agency name;
- 40px Agency name on desktop, 36px on mobile;
- prominent dark Official Website Action aligned right on desktop and below the name on mobile.

Media section:

- one large white 16px-radius container;
- Agency Screenshot centered and displayed at its complete 16:10 ratio;
- no browser-frame decoration unless later approved;
- no carousel or additional invented artwork.

Information section:

- “About” heading at 32px;
- the verified description in a readable column around 540px wide;
- logo may appear as supporting identity but never replace the Agency Screenshot;
- do not generate services, clients, projects, awards, ratings, or testimonials from the slogan.

## About

The About page follows the Design Engineer Club editorial composition rather than the earlier oversized title and two-column panels:

- an accessible hidden page H1 followed by the editorial content without a decorative hero or image treatment;
- a centered 624px reading column;
- stacked sections separated by one-pixel rules, with 12px muted labels and 16/24px body copy;
- no page-level Connect block; global navigation and footer already provide those actions.

The page explains:

- the purpose of studio.list;
- the Published Agency eligibility rule;
- the Agency Screenshot and refresh standard;
- how source data is maintained;
- that external websites are owned and operated by their respective agencies.

Do not invent a team story, partnerships, endorsements, audience statistics, or impact claims.

## Footer

Preserve the reference site's generous whitespace and quiet multi-column rhythm, but include only:

- the `studio.list` wordmark;
- `Discover`, `About`, and `Submit` links;
- a link to `github.com/dingyi/studio.list`;
- the external-site ownership disclaimer;
- the current copyright year.

Do not add a newsletter, agency rankings, category/brand link farms, or unprovided social profiles.

## Search and filtering states

- The centered header search trigger opens a command-style modal matching the Design Engineer Club interaction.
- Dim and softly blur the page with a neutral scrim; place a 628px white panel 6–8px from the viewport top.
- With an empty query, the panel contains only a 44px search input row and a visible `Esc` close affordance. Do not add quick links, suggestions, or previews.
- Once the visitor types, show up to 12 matching Agencies directly below the input, following Curated Supply's two-line result pattern: Agency name first and `/agencies/{slug}` as muted secondary text.
- The first result receives a subtle active background. Arrow keys move the active row, Enter opens it, pointer hover updates the active row, and Clear returns to the input-only state.
- On Discover, typing also filters the directory behind the overlay and keeps the query synchronized to the URL.
- On About and Agency Detail, opening and closing search must preserve the current route. Selecting a result opens its Agency Detail.
- Search matches Agency name and Agency Description, updates results immediately, and synchronizes the value to the `q` URL parameter.
- `Escape`, the close action, or clicking the scrim closes the layer while preserving an applied query.
- Do not duplicate search as a persistent toolbar field.
- Input feedback is immediate, but avoid animating every result aggressively.
- Active country appears as a white filled pill or selected combobox value.
- Empty state stays on the gray canvas and states which search/country produced no match; offer one clear reset action.
- Never show a candidate whose screenshot failed validation as a Published Agency.

## SEO and sharing

- Every Published Agency Detail may be indexed.
- Generate a unique title, source-preserving description, canonical URL, Open Graph metadata, and sitemap entry for each detail page.
- Do not index duplicate query-parameter combinations created by search, country filtering, view switching, or pagination.
- Use a canonical URL without catalog-state query parameters for the Discover page.
- Exclude Agency Candidates and failed screenshot records from sitemaps and structured data.

## Motion

- Default transition: 180ms ease-out.
- Large page transitions: at most 240ms.
- Animate opacity, background color, and small transforms only.
- Honor `prefers-reduced-motion`; remove scale and translate effects when requested.
- Loading images should fade in only after decode; reserve aspect-ratio space to prevent layout shift.

## Responsive behavior

| Width        | Grid      | Page inset | Navigation                 |
| ------------ | --------- | ---------- | -------------------------- |
| `>= 1100px`  | 3 columns | 36px       | left links + center search |
| `700–1099px` | 2 columns | 24px       | compact desktop/tablet nav |
| `< 700px`    | 1 column  | 16px       | logo + search + menu       |

- Filters become horizontally scrollable before wrapping into multiple noisy rows.
- Detail header actions stack on mobile.
- Long Agency names wrap; they are never marquee-scrolled or reduced below the defined title size solely to fit.

## Accessibility

- Use semantic links for both detail navigation and external navigation.
- Give the external action an accessible name such as “Visit {Agency name} website”.
- Never rely on Hover alone; keyboard focus and touch states must provide the same action.
- Use a visible 2px focus ring with at least 2px offset.
- Maintain WCAG AA contrast for text and controls.
- Agency Screenshot alt text: “Homepage screenshot of {Agency name}”. Decorative logos use empty alt text when the Agency name is already adjacent.
- Preserve logical heading order and announce filtered result counts.

## shadcn / Base UI mapping

Use shadcn components configured with Base UI primitives where interaction semantics add value:

- `Button` for search, view switch, pagination, back, and website actions;
- `Input` for keyword search;
- `Combobox` or `Select` for the single country filter;
- `ToggleGroup` for card/list view;
- `Tooltip` for icon-only desktop actions;
- `Sheet` for mobile navigation;
- `Dialog` or `Toast` for the non-persistent Submit availability notice;
- `Card` only as source code structure—the visual styling must follow this document, not the default shadcn appearance.

Prefer Astro components for static page structure and use React islands only for interactive search, filtering, view switching, and menus.

## Explicit exclusions

- No ratings, rankings, reviews, comparison, marketplace checkout, or agency claims.
- No favorites, saved agencies, accounts, or cross-device synchronization.
- No service categories until reliable structured data exists.
- No placeholder image presented as an Agency Screenshot.
- No glassmorphism, gradients, oversized shadows, neon accents, or dashboard panels.
- No copied Curated Supply branding, copy, product imagery, or commerce behavior.
