import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import agencies from "../src/data/agencies.json";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(resolve(root, "src/data/screenshot-manifest.json"), "utf8"),
) as Record<string, { status: "success" | "review" | "failed"; path?: string }>;
const errors: string[] = [];
let validated = 0;

for (const agency of agencies) {
  const entry = manifest[agency.slug];
  if (entry?.status !== "success") continue;
  if (!entry.path) {
    errors.push(`${agency.slug}: success entry has no public path`);
    continue;
  }

  const file = resolve(root, `public${entry.path}`);
  try {
    await access(file);
    const metadata = await sharp(file).metadata();
    if (
      metadata.width !== 1440 ||
      metadata.height !== 900 ||
      metadata.format !== "webp"
    ) {
      errors.push(
        `${agency.slug}: expected 1440×900 WebP, found ${metadata.width}×${metadata.height} ${metadata.format}`,
      );
    }
    validated += 1;
  } catch (error) {
    errors.push(
      `${agency.slug}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${validated} published screenshots at 1440×900 WebP.`);
}
