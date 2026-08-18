import { createHash } from "node:crypto";

export interface CaseStudyLink {
  url: string;
  title: string;
}

interface Anchor {
  href: string;
  text: string;
}

const workKeywords =
  /\b(selected\s+)?work\b|\bcase\s*(?:stud(y|ies))?\b|\bprojects?\b|\bportfolio\b/i;

const workPathPattern =
  /^\/?(?:selected-)?(?:work|cases?|case-studies|projects?|portfolio)\/?$/i;

const excludedPathPattern =
  /^\/(?:about|contact|teams?|services?|blog|news|journal|articles?|writings?|careers?|jobs?|[\w-]*tags?|[\w-]*categor(?:y|ies)|authors?|search|shop|store|feed|rss|press|faq|process|approach|expertise|clients?|privacy[\w-]*|terms[\w-]*|legal[\w-]*|imprint[\w-]*|cookies?[\w-]*)(\/|$)/i;

const ctaTextPattern =
  /^(?:work with us|get in touch|contact(?: us)?|let'?s talk|start(?: a)? project|say hello|hire us|about(?: us)?|our services|services)$/i;

const paginationPattern = /\/(?:page|p)\/\d+\/?$/i;

const caseEntryPathPattern =
  /^\/(?:work|projects?|cases?|case-studies|portfolio)\/[^/]+\/?$/i;

const titleNoisePattern =
  /\b(?:view|read|see|explore|discover|open)\b[\s\S]*$/i;

function stripContainerBlocks(html: string): string {
  return html.replace(
    /<(header|nav|footer)\b[\s\S]*?<\/\1>/gi,
    " ",
  );
}

function anchorText(innerHtml: string): string {
  const heading = innerHtml.match(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/i);
  const source = heading ? heading[1] : innerHtml;
  const text = source
    .replace(/<img\b[^>]*?\balt\s*=\s*"([^"]*)"[^>]*>/gi, " $1 ")
    .replace(/<img\b[^>]*?\balt\s*=\s*'([^']*)'[^>]*>/gi, " $1 ")
    .replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function extractAnchors(html: string): Anchor[] {
  const anchors: Anchor[] = [];
  const pattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const hrefMatch = match[1].match(
      /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();
    if (!href || /^(?:mailto|tel|javascript|data):/i.test(href)) continue;
    anchors.push({ href, text: anchorText(match[2]) });
  }
  return anchors;
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function sameSiteUrl(href: string, baseUrl: string): URL | null {
  try {
    const base = new URL(baseUrl);
    const url = new URL(href, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (normalizeHostname(url.hostname) !== normalizeHostname(base.hostname))
      return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function normalizedPath(url: URL): string {
  return url.pathname.replace(/\/+$/, "") || "/";
}

export function findWorkPageUrl(
  html: string,
  baseUrl: string,
): string | null {
  const base = new URL(baseUrl);
  const homePath = normalizedPath(base);
  let best: { url: string; score: number } | null = null;
  const seen = new Set<string>();

  // Keep header/nav here: the work-page link usually lives in primary nav.
  for (const anchor of extractAnchors(html)) {
    const url = sameSiteUrl(anchor.href, baseUrl);
    if (!url) continue;
    const path = normalizedPath(url);
    if (path === homePath) continue;
    const key = url.toString();
    if (seen.has(key)) continue;
    seen.add(key);

    let score = 0;
    if (workPathPattern.test(path)) score += 4;
    if (workKeywords.test(anchor.text)) score += 2;
    if (workKeywords.test(path)) score += 1;
    if (excludedPathPattern.test(path) || paginationPattern.test(path))
      score -= 10;
    if (path.split("/").filter(Boolean).length > 1) score -= 3;
    if (url.search) score -= 2;
    if (score < 2) continue;

    if (!best || score > best.score) best = { url: key, score };
  }

  if (best) return best.url;

  // Fallback: some studios list their projects directly on the homepage
  // (e.g. links to /projects/<slug>). Treat the homepage as the work page
  // when it carries at least two such entry links.
  const entryLinks = new Set<string>();
  for (const anchor of extractAnchors(stripContainerBlocks(html))) {
    const url = sameSiteUrl(anchor.href, baseUrl);
    if (!url) continue;
    if (caseEntryPathPattern.test(normalizedPath(url))) entryLinks.add(url.toString());
    if (entryLinks.size >= 2) {
      const home = new URL(baseUrl);
      home.hash = "";
      return home.toString();
    }
  }

  return null;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&[lr]dquo;/gi, '"')
    .replace(/&[lm]dash;/gi, "—");
}

export function isReadableTitle(title: string): boolean {
  const compact = title.replace(/\s+/g, "");
  if (compact.length < 2) return false;
  // Runs of symbols are decorative ASCII art, not a title.
  if (/[^\p{L}\p{N}\s]{3,}/u.test(title)) return false;
  const letters = compact.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  return letters / compact.length >= 0.5;
}

export function cleanCaseStudyTitle(value: string): string {
  let title = decodeEntities(value).replace(/\s+/g, " ").trim();
  // SEO titles are usually "Page title | Site name".
  title = title.split("|")[0].trim();
  title = title.replace(titleNoisePattern, "").trim();
  title = title.replace(/[→↗⟶»›\-\u2013\u2014|·\s]+$/u, "").trim();
  // Animated or duplicated markup often repeats the same phrase verbatim
  // ("Nike - On Air Nike - On Air Nike - On Air"). Collapse leading exact
  // repeats, but keep short legit repetitions like "Samsøe Samsøe".
  const words = title.split(" ");
  for (let unit = 3; unit <= words.length / 2; unit++) {
    let repeats = 1;
    while (
      (repeats + 1) * unit <= words.length &&
      words
        .slice(repeats * unit, (repeats + 1) * unit)
        .every((word, index) => word === words[index])
    ) {
      repeats++;
    }
    if (repeats >= 2) {
      title = [...words.slice(0, unit), ...words.slice(repeats * unit)].join(" ");
      break;
    }
  }
  if (title.length > 90) {
    const cut = title.lastIndexOf(" ", 90);
    title = `${title.slice(0, cut > 40 ? cut : 90).trimEnd()}…`;
  }
  return title;
}

export function extractCaseStudyLinks(
  html: string,
  workPageUrl: string,
  { limit = 6, requireNested = false }: { limit?: number; requireNested?: boolean } = {},
): CaseStudyLink[] {
  const work = new URL(workPageUrl);
  const workPath = normalizedPath(work);
  const results: CaseStudyLink[] = [];
  const seen = new Set<string>();

  for (const anchor of extractAnchors(stripContainerBlocks(html))) {
    const url = sameSiteUrl(anchor.href, workPageUrl);
    if (!url) continue;
    const path = normalizedPath(url);
    if (path === "/" || path === workPath) continue;
    if (excludedPathPattern.test(path) || paginationPattern.test(path))
      continue;
    const segments = path.split("/").filter(Boolean).length;
    if (!segments) continue;
    // On a homepage-as-work-page, single-segment links (/about, /archive)
    // are navigation, not case studies.
    if (requireNested && segments < 2) continue;
    if (ctaTextPattern.test(cleanCaseStudyTitle(anchor.text))) continue;

    const key = url.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ url: key, title: cleanCaseStudyTitle(anchor.text) });
    if (results.length >= limit) break;
  }

  return results;
}

export function caseStudyId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 12);
}

export function entriesHash(entries: CaseStudyLink[]): string {
  const urls = entries.map((entry) => entry.url).sort();
  return createHash("sha256").update(urls.join("\n")).digest("hex");
}
