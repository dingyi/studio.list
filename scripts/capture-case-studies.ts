import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Page } from "@playwright/test";
import sharp from "sharp";

import agencies from "../src/data/agencies.json";
import screenshotManifestData from "../src/data/screenshot-manifest.json";
import {
  caseStudyId,
  cleanCaseStudyTitle,
  dedupeAcrossAgencies,
  entriesHash,
  extractCaseStudyLinks,
  findWorkPageUrl,
  isReadableTitle,
  type CaseStudyLink,
} from "./lib/case-studies";

interface CaseStudyEntry {
  id: string;
  agencySlug: string;
  title: string;
  url: string;
  image: string;
  capturedAt: string;
}

type CaseStudyStatus = "success" | "no-work-page" | "no-entries" | "failed";

interface ManifestEntry {
  status: CaseStudyStatus;
  entriesHash?: string;
  homepageUrl: string;
  workPageUrl?: string;
  capturedAt: string;
  error?: string;
}

type Manifest = Record<string, ManifestEntry>;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "src/data/case-study-manifest.json");
const dataPath = resolve(root, "src/data/case-studies.json");
const thumbnailDir = resolve(root, "public/case-studies");
const perAgencyLimit = 6;

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, value = "true"] = argument.replace(/^--/, "").split("=", 2);
    return [key, value];
  }),
);
const limit = Number(args.get("limit") ?? Number.POSITIVE_INFINITY);
const concurrency = Math.max(
  1,
  Math.min(6, Number(args.get("concurrency") ?? 3)),
);
const navigationTimeout = Math.max(
  5_000,
  Math.min(60_000, Number(args.get("timeout") ?? 25_000)),
);
const idleTimeout = Math.max(
  1_000,
  Math.min(15_000, Number(args.get("idle-timeout") ?? 5_000)),
);
const requestedSlug = args.get("slug");
const force = args.has("force");

const publishedSlugs = new Set(
  Object.entries(
    screenshotManifestData as Record<string, { status: string }>,
  )
    .filter(([, entry]) => entry.status === "success")
    .map(([slug]) => slug),
);

await mkdir(thumbnailDir, { recursive: true });

let manifest: Manifest = {};
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
} catch {
  // A missing or empty manifest starts a fresh capture run.
}

let storedEntries: CaseStudyEntry[] = [];
try {
  storedEntries = JSON.parse(await readFile(dataPath, "utf8")) as CaseStudyEntry[];
} catch {
  // A missing data file starts empty.
}
const entriesBySlug = new Map<string, CaseStudyEntry[]>();
for (const entry of storedEntries) {
  const group = entriesBySlug.get(entry.agencySlug) ?? [];
  group.push(entry);
  entriesBySlug.set(entry.agencySlug, group);
}

const candidates = agencies
  .filter((agency) => publishedSlugs.has(agency.slug))
  .filter((agency) => !requestedSlug || agency.slug === requestedSlug)
  .slice(0, limit);

if (
  requestedSlug &&
  candidates.length === 0 &&
  !agencies.some((agency) => agency.slug === requestedSlug)
) {
  throw new Error(`Unknown agency slug: ${requestedSlug}`);
}

let manifestWrite = Promise.resolve();
async function saveManifest() {
  manifestWrite = manifestWrite.then(async () => {
    const temporaryPath = `${manifestPath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await rename(temporaryPath, manifestPath);
  });
  await manifestWrite;
}

async function dismissCommonOverlays(page: Page) {
  await page.keyboard.press("Escape").catch(() => undefined);
  const labels = [
    /accept all/i,
    /accept cookies/i,
    /allow all/i,
    /agree/i,
    /continue without accepting/i,
    /decline/i,
    /deny/i,
    /got it/i,
    /^ok(?:ay)?$/i,
    /reject all/i,
    /close/i,
  ];

  for (const label of labels) {
    const control = page.getByRole("button", { name: label }).first();
    if (await control.isVisible().catch(() => false)) {
      await control.click({ timeout: 1_500 }).catch(() => undefined);
      await page.waitForTimeout(200);
    }
  }
}

async function hasObstructiveOverlay(page: Page) {
  return page.evaluate(() => {
    const pageText = (document.body.innerText || "").slice(0, 4_000);
    if (
      /your browser is not supported|browser (?:is )?unsupported|enable javascript|access denied|checking your browser|just a moment/i.test(
        pageText,
      )
    ) {
      return true;
    }
    const viewportArea = window.innerWidth * window.innerHeight;
    const keywords =
      /cookie|consent|privacy|subscribe|newsletter|sign up|modal/i;
    return Array.from(document.body.querySelectorAll<HTMLElement>("*"))
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.position !== "fixed" && style.position !== "sticky")
          return false;
        const rect = element.getBoundingClientRect();
        if (rect.width * rect.height < viewportArea * 0.02) return false;
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false;
        return keywords.test((element.innerText || "").slice(0, 800));
      })
      .some((element) => getComputedStyle(element).visibility !== "hidden");
  });
}

async function readPageTitle(page: Page): Promise<string> {
  return page
    .evaluate(() => {
      // The project name is usually the page's h1; og:title and the
      // document title tend to carry SEO noise and the site name.
      const heading = document.querySelector("h1")?.textContent;
      const og = document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content");
      return (heading || og || document.title || "").trim();
    })
    .catch(() => "");
}

async function captureEntry(
  page: Page,
  agencySlug: string,
  link: CaseStudyLink,
): Promise<CaseStudyEntry | null> {
  const capturedAt = new Date().toISOString();
  const response = await page.goto(link.url, {
    waitUntil: "domcontentloaded",
    timeout: navigationTimeout,
  });
  if (!response || response.status() >= 400)
    throw new Error(`HTTP ${response?.status() ?? "no response"}`);

  await page
    .waitForLoadState("networkidle", { timeout: idleTimeout })
    .catch(() => undefined);
  await dismissCommonOverlays(page);
  await page.waitForTimeout(500);

  const png = await page.screenshot({
    type: "png",
    fullPage: false,
    animations: "disabled",
  });
  const visuallyBlank = (await sharp(png).stats()).entropy < 0.003;
  const obstructed = await hasObstructiveOverlay(page);
  if (visuallyBlank || obstructed) return null;

  const id = caseStudyId(link.url);
  const image = `/case-studies/${agencySlug}/${id}.webp`;
  await mkdir(resolve(root, `public/case-studies/${agencySlug}`), {
    recursive: true,
  });
  await sharp(png)
    .webp({ quality: 82 })
    .toFile(resolve(root, `public${image}`));

  let title = link.title;
  if (!isReadableTitle(title))
    title = cleanCaseStudyTitle(await readPageTitle(page));
  if (!isReadableTitle(title)) {
    title = new URL(link.url).pathname.split("/").filter(Boolean).pop() ?? "";
    title = title.replace(/[-_]+/g, " ").trim();
  }

  return { id, agencySlug, title, url: link.url, image, capturedAt };
}

const browser = await chromium.launch({ headless: true });
let cursor = 0;
let completed = 0;

async function worker(workerIndex: number) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-US",
  });

  while (cursor < candidates.length) {
    const agency = candidates[cursor++];
    const capturedAt = new Date().toISOString();
    const page = await context.newPage();
    try {
      const homepageResponse = await page.goto(agency.website, {
        waitUntil: "domcontentloaded",
        timeout: navigationTimeout,
      });
      if (!homepageResponse || homepageResponse.status() >= 400)
        throw new Error(`HTTP ${homepageResponse?.status() ?? "no response"}`);
      await page
        .waitForLoadState("networkidle", { timeout: idleTimeout })
        .catch(() => undefined);

      const homepageUrl = page.url();
      const workPageUrl = findWorkPageUrl(await page.content(), homepageUrl);
      if (!workPageUrl) {
        manifest[agency.slug] = {
          status: "no-work-page",
          homepageUrl: agency.website,
          capturedAt,
        };
        entriesBySlug.delete(agency.slug);
        continue;
      }

      const normalizeForCompare = (value: string) => {
        const parsed = new URL(value);
        parsed.hash = "";
        return parsed.toString().replace(/\/+$/, "");
      };
      const workIsHomepage =
        normalizeForCompare(workPageUrl) === normalizeForCompare(homepageUrl);

      if (!workIsHomepage) {
        const workResponse = await page.goto(workPageUrl, {
          waitUntil: "domcontentloaded",
          timeout: navigationTimeout,
        });
        if (!workResponse || workResponse.status() >= 400)
          throw new Error(`HTTP ${workResponse?.status() ?? "no response"}`);
        await page
          .waitForLoadState("networkidle", { timeout: idleTimeout })
          .catch(() => undefined);
      }

      const links = extractCaseStudyLinks(await page.content(), page.url(), {
        limit: perAgencyLimit,
        requireNested: workIsHomepage,
      });
      const hash = entriesHash(links);
      const previous = manifest[agency.slug];
      if (
        !force &&
        previous?.status === "success" &&
        previous.entriesHash === hash
      ) {
        // No updates on the work page; keep the stored entries as-is.
        continue;
      }
      if (links.length === 0) {
        manifest[agency.slug] = {
          status: "no-entries",
          entriesHash: hash,
          homepageUrl: agency.website,
          workPageUrl,
          capturedAt,
        };
        entriesBySlug.delete(agency.slug);
        continue;
      }

      const kept = (entriesBySlug.get(agency.slug) ?? []).filter((entry) =>
        links.some((link) => link.url === entry.url),
      );
      const captured: CaseStudyEntry[] = [];
      for (const link of links) {
        const existing = kept.find((entry) => entry.url === link.url);
        if (existing && !force) {
          captured.push(existing);
          continue;
        }
        try {
          const entry = await captureEntry(page, agency.slug, link);
          if (entry) captured.push(entry);
          else console.log(`  skipped (blank/obstructed): ${link.url}`);
        } catch (error) {
          // A single failing case study page does not fail the agency.
          console.log(
            `  failed: ${link.url} — ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      entriesBySlug.set(agency.slug, captured);
      manifest[agency.slug] = {
        status: captured.length ? "success" : "no-entries",
        entriesHash: hash,
        homepageUrl: agency.website,
        workPageUrl,
        capturedAt,
      };
    } catch (error) {
      manifest[agency.slug] = {
        status: "failed",
        homepageUrl: agency.website,
        capturedAt,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await page.close().catch(() => undefined);
      const progress = ++completed;
      await saveManifest();
      console.log(
        `[${progress}/${candidates.length}] worker ${workerIndex}: ${agency.name} — ${manifest[agency.slug]?.status ?? "unchanged"}`,
      );
    }
  }

  await context.close();
}

try {
  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, candidates.length) },
      (_, index) => worker(index + 1),
    ),
  );
} finally {
  await browser.close();
}

const websiteBySlug = new Map(
  agencies.map((agency) => [agency.slug, agency.website]),
);
const allEntries = dedupeAcrossAgencies(
  Array.from(entriesBySlug.values())
    .flat()
    .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt)),
  websiteBySlug,
);
const temporaryDataPath = `${dataPath}.${process.pid}.${Date.now()}.tmp`;
await writeFile(temporaryDataPath, `${JSON.stringify(allEntries, null, 2)}\n`);
await rename(temporaryDataPath, dataPath);

console.log(
  `Capture finished: ${completed} agencies processed, ${allEntries.length} case studies stored.`,
);
