# studio.list

An independent, image-led directory of design agencies. The site is built with Astro, React, Tailwind CSS, and shadcn components powered by Base UI.

## Local development

```bash
pnpm install
pnpm data:import
pnpm dev
```

The agency importer reads the `studios` section of the source YAML, normalizes official domains, merges duplicates, and copies available logos into `public/logos`. It defaults to a sibling `dex.list` checkout; set `AGENCY_SOURCE=/path/to/agency.yml` to use another source.

## Screenshots

Agency screenshots are captured separately from the site build:

```bash
pnpm exec playwright install chromium
pnpm screenshots:capture -- --concurrency=3
pnpm screenshots:report
pnpm screenshots:audit
pnpm screenshots:validate
```

Useful options include `--limit=20`, `--slug=agency-slug`, `--retry=transient`, `--before=2026-07-15T16:33:00.000Z`, `--timeout=15000`, `--idle-timeout=3000`, and `--force`. The optional `before` boundary supports exact resume runs by selecting only entries last attempted before that timestamp. Successful captures and items awaiting manual review are skipped by default. Only entries with a successful, unobstructed capture in `src/data/screenshot-manifest.json` are published. Possible consent or subscription obstructions are saved under `public/screenshots/review` for manual review.

Review and cleanup commands:

```bash
pnpm screenshots:review -- --slug=agency-slug --approve
pnpm screenshots:review -- --slug=agency-slug --reject
pnpm screenshots:clean
```

## Quality checks

```bash
pnpm test:run
pnpm check
pnpm build
pnpm test:e2e
```

## Data and third-party assets

The source data, agency names, descriptions, logos, and website screenshots belong to their respective owners. Their inclusion in this repository does not grant additional rights or imply endorsement, affiliation, or ownership by studio.list.

The MIT license applies to the original source code and documentation in this repository. It does **not** apply to third-party agency data, logos, trademarks, or screenshots under `public/logos`, `public/screenshots`, and generated data files derived from the source catalog. See [THIRD_PARTY_ASSETS.md](./THIRD_PARTY_ASSETS.md).
