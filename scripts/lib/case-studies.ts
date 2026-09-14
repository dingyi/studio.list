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
  /^\/(?:about[\w-]*|contact|teams?|services?|blog|news|journal|articles?|insights?|our-story|studio|careers?|jobs?|tags?|[\w-]*categor(?:y|ies)|authors?|search|shop|store|cart|checkout|basket|feed|rss|press|faq|process|approach|expertise|clients?|privacy[\w-]*|terms[\w-]*|legal[\w-]*|imprint[\w-]*|cookies?[\w-]*)(\/|$)/i;

const ctaTextPattern =
  /^(?:work with us|get in touch|contact(?: us)?|let'?s talk|start(?: a)? project|say hello|hire us|about(?: us)?|our services|services)$/i;

const paginationPattern = /\/(?:page|p)\/\d+\/?$/i;

const caseEntryPathPattern =
  /^\/(?:work|projects?|cases?|case-studies|portfolio)\/[^/]+\/?$/i;

// A listing page, including its tag-filtered variants, is not a case study.
const indexPathPattern =
  /^\/(?:(?:selected-)?works?|cases?|case-studies|projects?|portfolio|explore|archive|index|all|gallery|showcase|lab)$/i;

const titleNoisePattern =
  /\b(?:view|read|see|explore|discover|open)\b[\s\S]*$/i;

function stripContainerBlocks(html: string): string {
  return html.replace(
    /<(header|nav|footer)\b[\s\S]*?<\/\1>/gi,
    " ",
  );
}

function anchorText(innerHtml: string): string {
  const withoutEmbedded = innerHtml.replace(
    /<(style|script|svg|noscript)\b[\s\S]*?<\/\1>/gi,
    " ",
  );
  const heading = withoutEmbedded.match(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/i);
  const source = heading ? heading[1] : withoutEmbedded;
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

export interface AgencyIdentity {
  officialDomain: string;
  name: string;
}

const trackingParamPattern =
  /^(?:source|sk|sharedUserId|ref|si|utm_[\w-]+)$/i;

function handleKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function agencyHandles(agency: AgencyIdentity): Set<string> {
  const domainBase = normalizeHostname(agency.officialDomain).split(".")[0];
  return new Set([
    handleKey(domainBase),
    handleKey(agency.name),
    handleKey(agency.name.replace(/&|\band\b/gi, "")),
  ]);
}

/**
 * Some studios publish their case studies on a publishing platform instead of
 * their own domain. Accept such a link only when it sits inside a publication
 * space whose handle matches the agency's own identity — a work page also
 * links to client websites and booking tools, which are not case studies.
 */
export function agencyPublicationUrl(
  href: string,
  baseUrl: string,
  agency: AgencyIdentity,
): URL | null {
  let url: URL;
  try {
    url = new URL(href, baseUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = normalizeHostname(url.hostname);
  const segments = url.pathname.split("/").filter(Boolean);
  const handles = agencyHandles(agency);
  const owned = (candidate: string) => handles.has(handleKey(candidate));

  if (host === "medium.com") {
    // medium.com/<publication>/<post>; the publication root is an index.
    if (segments.length < 2) return null;
    if (!owned(segments[0].replace(/^@/, ""))) return null;
  } else if (host.endsWith(".medium.com")) {
    if (segments.length < 1) return null;
    if (!owned(host.slice(0, -".medium.com".length))) return null;
  } else if (host.endsWith(".substack.com")) {
    if (segments[0] !== "p" || segments.length < 2) return null;
    if (!owned(host.slice(0, -".substack.com".length))) return null;
  } else {
    return null;
  }

  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (trackingParamPattern.test(key)) url.searchParams.delete(key);
  }
  return url;
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
  // Generic media placeholders (usually from alt text) and navigation labels
  // name no project, so the capture falls back to the page heading or slug.
  if (
    /^(?:image|img|video|photo|logo|icon|thumbnail|untitled|link|our\s+work|work|home|menu|lab|explore|archive|overview)s?$/i.test(
      title.trim(),
    )
  )
    return false;
  // Letter-spaced animation markup ("H u t t e") is unreadable as a title.
  const words = title.trim().split(/\s+/);
  const singleCharWords = words.filter((word) => [...word].length === 1).length;
  if (words.length >= 4 && singleCharWords / words.length >= 0.7) return false;
  const letters = compact.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  return letters / compact.length >= 0.5;
}

/**
 * Image alt text describes the picture instead of naming the project ("A hand
 * holding a mobile phone displaying …"). Such a value is readable but makes a
 * poor card title, so the capture prefers the project page's own heading.
 */
export function looksLikeDescription(title: string): boolean {
  const value = title.trim();
  if (value.length <= 45) return false;
  if (
    /^(?:an?|the|image|images|photo|photos|picture|screenshot|screengrab|view|close-?up|illustration|portrait|shot)\b/i.test(
      value,
    )
  ) {
    return true;
  }
  // Prose runs on in lowercase words, while project names are short or
  // capitalised ("Gen Z Broke the Marketing Funnel" stays a name).
  const words = value.split(/\s+/);
  if (words.length < 7) return false;
  const rest = words.slice(1);
  const lowercase = rest.filter((word) => /^\p{Ll}/u.test(word)).length;
  return lowercase / rest.length >= 0.6;
}

/**
 * The last path segment of a case-study URL is usually the project name, which
 * beats prose pulled from alt text or a page's marketing headline.
 */
export function titleFromUrl(url: string): string {
  let segment: string;
  try {
    segment = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return "";
  }
  return segment
    .replace(/\.\w{2,5}$/, "")
    // Publishing platforms append an opaque id to the slug.
    .replace(/[-_][0-9a-f]{8,}$/i, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

/**
 * Animated or duplicated markup repeats a phrase verbatim ("Walden Robotics
 * Walden Robotics AI, Robotics"). Collapse adjacent repeats of two or more
 * words wherever they occur, keeping short brand repetitions like
 * "Samsøe Samsøe" intact.
 */
function collapseRepeatedPhrases(title: string): string {
  let words = title.split(" ");
  // Collapsing a short repeat can expose a longer one ("A B C A B A B C"
  // becomes "A B C A B C"), so rescan from the largest unit until stable.
  for (let changed = true; changed; ) {
    changed = false;
    for (let unit = Math.floor(words.length / 2); unit >= 2 && !changed; unit--) {
      for (let start = 0; start + 2 * unit <= words.length; start++) {
        const phrase = words.slice(start, start + unit);
        let repeats = 1;
        while (
          start + (repeats + 1) * unit <= words.length &&
          words
            .slice(start + repeats * unit, start + (repeats + 1) * unit)
            .every(
              (word, index) =>
                word.toLowerCase() === phrase[index].toLowerCase(),
            )
        ) {
          repeats++;
        }
        if (repeats >= 2) {
          words = [
            ...words.slice(0, start + unit),
            ...words.slice(start + repeats * unit),
          ];
          changed = true;
          break;
        }
      }
    }
  }
  return words.join(" ").replace(/\s+/g, " ").trim();
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
  title = collapseRepeatedPhrases(title);
  if (title.length > 90) {
    const cut = title.lastIndexOf(" ", 90);
    title = `${title.slice(0, cut > 40 ? cut : 90).trimEnd()}…`;
  }
  return title;
}

export function extractCaseStudyLinks(
  html: string,
  workPageUrl: string,
  {
    limit = 6,
    requireNested = false,
    agency,
  }: { limit?: number; requireNested?: boolean; agency?: AgencyIdentity } = {},
): CaseStudyLink[] {
  const work = new URL(workPageUrl);
  const workPath = normalizedPath(work);
  const results: CaseStudyLink[] = [];
  const seen = new Set<string>();

  for (const anchor of extractAnchors(stripContainerBlocks(html))) {
    let url = sameSiteUrl(anchor.href, workPageUrl);
    const publication = url
      ? null
      : agency
        ? agencyPublicationUrl(anchor.href, workPageUrl, agency)
        : null;
    url ??= publication;
    if (!url) continue;
    const path = normalizedPath(url);
    if (!publication) {
      if (path === "/" || path === workPath) continue;
      if (
        excludedPathPattern.test(path) ||
        paginationPattern.test(path) ||
        indexPathPattern.test(path)
      )
        continue;
      const segments = path.split("/").filter(Boolean).length;
      if (!segments) continue;
      // On a homepage-as-work-page, single-segment links (/about, /archive)
      // are navigation, not case studies.
      if (requireNested && segments < 2) continue;
    }
    if (ctaTextPattern.test(cleanCaseStudyTitle(anchor.text))) continue;

    const key = url.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ url: key, title: cleanCaseStudyTitle(anchor.text) });
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Some agency homepages redirect to another agency's official website
 * (rebrands, mergers, acquisitions). Both directory entries then collect the
 * same case-study URLs. Keep each URL once: prefer the agency whose Official
 * Domain matches the case study's host, otherwise keep the first entry.
 */
export function dedupeAcrossAgencies<
  T extends { url: string; agencySlug: string },
>(entries: T[], websiteBySlug: Map<string, string>): T[] {
  const hostOf = (value: string): string | null => {
    try {
      return normalizeHostname(new URL(value).hostname);
    } catch {
      return null;
    }
  };
  const keptByUrl = new Map<string, T>();
  for (const entry of entries) {
    const current = keptByUrl.get(entry.url);
    if (!current) {
      keptByUrl.set(entry.url, entry);
      continue;
    }
    const entryHost = hostOf(entry.url);
    const currentMatches =
      hostOf(websiteBySlug.get(current.agencySlug) ?? "") === entryHost;
    const entryMatches =
      hostOf(websiteBySlug.get(entry.agencySlug) ?? "") === entryHost;
    if (entryMatches && !currentMatches) keptByUrl.set(entry.url, entry);
  }
  const kept = new Set(keptByUrl.values());
  return entries.filter((entry) => kept.has(entry));
}

export function caseStudyId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 12);
}

export function entriesHash(entries: CaseStudyLink[]): string {
  const urls = entries.map((entry) => entry.url).sort();
  return createHash("sha256").update(urls.join("\n")).digest("hex");
}
