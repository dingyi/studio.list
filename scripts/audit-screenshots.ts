import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "src/data/screenshot-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
  string,
  {
    status: "success" | "review" | "failed";
    path?: string;
    reviewPath?: string;
    error?: string;
    [key: string]: unknown;
  }
>;
let flagged = 0;

for (const [slug, entry] of Object.entries(manifest)) {
  if (entry.status !== "success" || !entry.path) continue;
  const publishedFile = resolve(root, `public${entry.path}`);
  const stats = await sharp(publishedFile).stats();
  if (stats.entropy >= 0.003) continue;

  const reviewPath = `/screenshots/review/${slug}.webp`;
  await rename(publishedFile, resolve(root, `public${reviewPath}`));
  manifest[slug] = {
    ...entry,
    status: "review",
    path: undefined,
    reviewPath,
    error:
      "The captured viewport appears visually blank and requires manual review.",
  };
  flagged += 1;
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Flagged ${flagged} visually blank captures for review.`);
