import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_URL =
  "https://raw.githubusercontent.com/jaywcjlove/free-font/main/scripts/data.json";
const INDEX_URL =
  "https://raw.githubusercontent.com/jaywcjlove/free-font/main/docs/index.html";

interface UpstreamFont {
  name: string;
  path: string;
  home?: string;
  license?: string;
  type?: string;
  size?: string;
  ctime?: number;
  familyName?: string;
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function previewImages(html: string) {
  const images = new Map<string, string>();
  const pattern =
    /href="details\/([^\"]+)\.html" title="[^\"]*">\s*<img\s+src="\.\/images\/([^\"]+-poster\.jpg)"/g;

  for (const match of html.matchAll(pattern)) {
    images.set(decodeHtml(match[1]), decodeHtml(match[2]));
  }

  return images;
}

async function fetchText(url: string) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  return response.text();
}

async function main() {
  const [dataSource, indexSource] = await Promise.all([
    fetchText(DATA_URL),
    fetchText(INDEX_URL),
  ]);
  const upstream = JSON.parse(dataSource) as UpstreamFont[];
  const images = previewImages(indexSource);
  const missingPreviews: string[] = [];

  const fonts = upstream
    .sort((left, right) => (right.ctime ?? 0) - (left.ctime ?? 0))
    .map((font) => {
      const image = images.get(font.name);
      if (!image) missingPreviews.push(font.name);

      return {
        name: font.name,
        license: font.license ?? "商免",
        type: font.type ?? null,
        size: font.size ?? null,
        familyName: font.familyName ?? null,
        preview: image ?? null,
        english: font.path.split("/").includes("english"),
        openSource: Boolean(
          font.home?.includes("github.com") ||
            font.home?.includes("gitlab.com"),
        ),
      };
    });

  if (missingPreviews.length)
    console.warn(
      `${missingPreviews.length} fonts have no preview image: ${missingPreviews.slice(0, 5).join(", ")}`,
    );

  const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const output = path.join(projectRoot, "src/data/free-fonts.json");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(fonts, null, 2)}\n`, "utf8");
  console.log(`Imported ${fonts.length} fonts to ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
