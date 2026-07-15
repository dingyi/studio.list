import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Page } from "@playwright/test";
import sharp from "sharp";

import agencies from "../src/data/agencies.json";

type ScreenshotStatus = "success" | "review" | "failed";

interface ManifestEntry {
  status: ScreenshotStatus;
  path?: string;
  reviewPath?: string;
  capturedAt: string;
  requestedUrl: string;
  finalUrl?: string;
  error?: string;
}

type Manifest = Record<string, ManifestEntry>;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "src/data/screenshot-manifest.json");
const screenshotDir = resolve(root, "public/screenshots");
const reviewDir = resolve(screenshotDir, "review");
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
  Math.min(15_000, Number(args.get("idle-timeout") ?? 7_000)),
);
const requestedSlug = args.get("slug");
const force = args.has("force");
const retryTransientOnly = args.get("retry") === "transient";
const capturedBefore = args.get("before");

await mkdir(reviewDir, { recursive: true });

let manifest: Manifest = {};
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
} catch {
  // A missing or empty manifest starts a fresh capture run.
}

const candidates = agencies
  .filter((agency) => !requestedSlug || agency.slug === requestedSlug)
  .filter((agency) => {
    if (force) return true;
    const entry = manifest[agency.slug];
    if (!entry) return true;
    if (entry.requestedUrl !== agency.website) return true;
    if (capturedBefore && entry.capturedAt >= capturedBefore) return false;
    if (entry.status === "success" || entry.status === "review") return false;
    if (!retryTransientOnly) return true;
    return /ERR_(?:CONNECTION|TIMED_OUT)|timeout|HTTP 5\d\d|no response/i.test(
      entry.error ?? "",
    );
  })
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
      const response = await page.goto(agency.website, {
        waitUntil: "domcontentloaded",
        timeout: navigationTimeout,
      });
      if (!response || response.status() >= 400)
        throw new Error(`HTTP ${response?.status() ?? "no response"}`);

      await page
        .waitForLoadState("networkidle", { timeout: idleTimeout })
        .catch(() => undefined);
      await page.evaluate(() => document.fonts.ready).catch(() => undefined);
      await dismissCommonOverlays(page);
      await page.waitForTimeout(700);
      await page.setViewportSize({ width: 1440, height: 900 });

      const png = await page.screenshot({
        type: "png",
        fullPage: false,
        animations: "disabled",
      });
      const visuallyBlank = (await sharp(png).stats()).entropy < 0.003;
      const obstructed = await hasObstructiveOverlay(page);
      if (obstructed || visuallyBlank) {
        const reviewPath = `/screenshots/review/${agency.slug}.webp`;
        await sharp(png)
          .webp({ quality: 82 })
          .toFile(resolve(root, `public${reviewPath}`));
        manifest[agency.slug] = {
          status: "review",
          reviewPath,
          capturedAt,
          requestedUrl: agency.website,
          finalUrl: page.url(),
          error: visuallyBlank
            ? "The captured viewport appears visually blank and requires manual review."
            : "A browser, consent, or subscription blocker may obstruct the homepage.",
        };
      } else {
        const publicPath = `/screenshots/${agency.slug}.webp`;
        await sharp(png)
          .webp({ quality: 82 })
          .toFile(resolve(root, `public${publicPath}`));
        manifest[agency.slug] = {
          status: "success",
          path: publicPath,
          capturedAt,
          requestedUrl: agency.website,
          finalUrl: page.url(),
        };
      }
    } catch (error) {
      manifest[agency.slug] = {
        status: "failed",
        capturedAt,
        requestedUrl: agency.website,
        finalUrl: page.url() === "about:blank" ? undefined : page.url(),
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await page.close().catch(() => undefined);
    }

    const progress = ++completed;
    await saveManifest();
    console.log(
      `[${progress}/${candidates.length}] worker ${workerIndex}: ${agency.name} — ${manifest[agency.slug].status}`,
    );
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

console.log(
  `Capture finished: ${completed} processed, ${agencies.length} total candidates.`,
);
