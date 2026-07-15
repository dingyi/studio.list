import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "src/data/screenshot-manifest.json");
const slug = process.argv
  .find((argument) => argument.startsWith("--slug="))
  ?.split("=")[1];
const decision = process.argv.includes("--approve")
  ? "approve"
  : process.argv.includes("--reject")
    ? "reject"
    : null;

if (!slug || !decision)
  throw new Error(
    "Usage: pnpm screenshots:review -- --slug=agency-slug --approve|--reject",
  );

const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
  string,
  {
    status: "success" | "review" | "failed";
    path?: string;
    reviewPath?: string;
    capturedAt: string;
    requestedUrl: string;
    finalUrl?: string;
    error?: string;
    reviewedAt?: string;
  }
>;
const entry = manifest[slug];
if (!entry || entry.status !== "review" || !entry.reviewPath)
  throw new Error(`${slug} is not awaiting review.`);

if (decision === "approve") {
  const publicPath = `/screenshots/${slug}.webp`;
  await rename(
    resolve(root, `public${entry.reviewPath}`),
    resolve(root, `public${publicPath}`),
  );
  manifest[slug] = {
    ...entry,
    status: "success",
    path: publicPath,
    reviewPath: undefined,
    error: undefined,
    reviewedAt: new Date().toISOString(),
  };
} else {
  await rm(resolve(root, `public${entry.reviewPath}`), { force: true });
  manifest[slug] = {
    ...entry,
    status: "failed",
    reviewPath: undefined,
    error: "Rejected during manual screenshot review.",
    reviewedAt: new Date().toISOString(),
  };
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${slug}: ${decision === "approve" ? "approved" : "rejected"}.`);
