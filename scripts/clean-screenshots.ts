import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import agencies from "../src/data/agencies.json";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(resolve(root, "src/data/screenshot-manifest.json"), "utf8"),
) as Record<
  string,
  {
    status: "success" | "review" | "failed";
    path?: string;
    reviewPath?: string;
  }
>;
const validSlugs = new Set(agencies.map((agency) => agency.slug));
for (const slug of Object.keys(manifest)) {
  if (!validSlugs.has(slug)) delete manifest[slug];
}
const screenshotDir = resolve(root, "public/screenshots");
const reviewDir = resolve(screenshotDir, "review");
const expectedPublished = new Set(
  Object.values(manifest).flatMap((entry) =>
    entry.status === "success" && entry.path
      ? [entry.path.split("/").pop()!]
      : [],
  ),
);
const expectedReview = new Set(
  Object.values(manifest).flatMap((entry) =>
    entry.status === "review" && entry.reviewPath
      ? [entry.reviewPath.split("/").pop()!]
      : [],
  ),
);
let removed = 0;

for (const file of await readdir(screenshotDir)) {
  if (!file.endsWith(".webp") || expectedPublished.has(file)) continue;
  await rm(resolve(screenshotDir, file), { force: true });
  removed += 1;
}
for (const file of await readdir(reviewDir)) {
  if (!file.endsWith(".webp") || expectedReview.has(file)) continue;
  await rm(resolve(reviewDir, file), { force: true });
  removed += 1;
}

await writeFile(
  resolve(root, "src/data/screenshot-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`Removed ${removed} stale screenshot files.`);
