import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import agencies from "../src/data/agencies.json";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(resolve(root, "src/data/screenshot-manifest.json"), "utf8"),
) as Record<
  string,
  { status: "success" | "review" | "failed"; error?: string }
>;

const counts = { success: 0, review: 0, failed: 0, pending: 0 };
for (const agency of agencies) {
  const status = manifest[agency.slug]?.status ?? "pending";
  counts[status] += 1;
}

console.log(JSON.stringify({ total: agencies.length, ...counts }, null, 2));
for (const agency of agencies) {
  const entry = manifest[agency.slug];
  if (entry && entry.status !== "success")
    console.log(`${entry.status}\t${agency.slug}\t${entry.error ?? ""}`);
}
