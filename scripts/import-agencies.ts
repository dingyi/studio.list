import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  normalizeAgencies,
  parseStudiosYaml,
  type ImportIssue,
} from "./lib/agency-data";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = resolve(root, "../dex.list/data/agency/agency.yml");
const sourcePath = resolve(
  process.argv[2] ?? process.env.AGENCY_SOURCE ?? defaultSource,
);
const sourceRoot = dirname(sourcePath);
const dataDir = resolve(root, "src/data");
const logoDir = resolve(root, "public/logos");

await mkdir(dataDir, { recursive: true });
await mkdir(logoDir, { recursive: true });

const source = await readFile(sourcePath, "utf8");
const raw = parseStudiosYaml(source);
const { agencies, issues } = normalizeAgencies(raw);
const issuesWithLogos: ImportIssue[] = [...issues];
const sourceLogoDir = resolve(sourceRoot, "images/agency");
const sourceLogoFiles = await readdir(sourceLogoDir);
const normalizedLogoNames = new Map(
  sourceLogoFiles.map((file) => [
    basename(file, `.${file.split(".").pop()}`)
      .normalize("NFKD")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase(),
    file,
  ]),
);

for (const agency of agencies) {
  const primaryLine = agency.sourceLines[0];
  const rawRecord = raw.find((record) => record.sourceLine === primaryLine);
  if (!rawRecord?.logo || !agency.logo) continue;

  let sourceLogo = resolve(sourceRoot, rawRecord.logo);
  const targetLogo = resolve(root, `public${agency.logo}`);
  try {
    await access(sourceLogo);
  } catch {
    const normalizedSourceName = basename(
      rawRecord.logo,
      `.${rawRecord.logo.split(".").pop()}`,
    )
      .normalize("NFKD")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();
    const matchingFile = normalizedLogoNames.get(normalizedSourceName);
    if (matchingFile) sourceLogo = resolve(sourceLogoDir, matchingFile);
  }

  try {
    await copyFile(sourceLogo, targetLogo);
  } catch {
    agency.logo = null;
    issuesWithLogos.push({
      type: "missing-logo",
      sourceLine: primaryLine,
      name: agency.name,
      detail: rawRecord.logo,
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  source: relative(root, sourcePath),
  sourceRecords: raw.length,
  candidates: agencies.length,
  issueCounts: Object.fromEntries(
    Array.from(new Set(issuesWithLogos.map((issue) => issue.type))).map(
      (type) => [
        type,
        issuesWithLogos.filter((issue) => issue.type === type).length,
      ],
    ),
  ),
  issues: issuesWithLogos,
};

await writeFile(
  resolve(dataDir, "agencies.json"),
  `${JSON.stringify(agencies, null, 2)}\n`,
);
await writeFile(
  resolve(dataDir, "import-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(
  `Imported ${raw.length} source records into ${agencies.length} candidates.`,
);
console.log(`Recorded ${issuesWithLogos.length} import issues.`);
