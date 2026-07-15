import { createHash } from "node:crypto";

export interface RawAgency {
  name: string;
  logo?: string;
  location?: string;
  description?: string;
  website?: string;
  sourceLine: number;
}

export interface AgencyLocation {
  code: string;
  name: string;
  flag: string;
}

export interface AgencyCandidate {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  description: string;
  website: string;
  officialDomain: string;
  locations: AgencyLocation[];
  logo: string | null;
  screenshot: string;
  sourceLines: number[];
}

export interface ImportIssue {
  type:
    | "missing-link"
    | "invalid-link"
    | "non-official-link"
    | "duplicate-domain"
    | "missing-logo";
  sourceLine: number;
  name: string;
  detail: string;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const profileDomains = new Set([
  "behance.net",
  "dribbble.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "medium.com",
  "twitter.com",
  "x.com",
]);

export function cleanScalar(value: string): string {
  let result = value.trim();
  const first = result.at(0);
  const last = result.at(-1);

  if ((first === "'" || first === '"') && last === first) {
    result = result.slice(1, -1);
  } else {
    if (first === "'" || first === '"') result = result.slice(1);
    if (last === "'" || last === '"') result = result.slice(0, -1);
  }

  return result.replace(/''/g, "'").replace(/\s+/g, " ").trim();
}

export function parseStudiosYaml(source: string): RawAgency[] {
  const records: RawAgency[] = [];
  let section = "";
  let current: RawAgency | null = null;

  const flush = () => {
    if (current?.name) records.push(current);
    current = null;
  };

  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const sectionMatch = line.match(/^- id:\s*(\S+)/);
    if (sectionMatch) {
      if (section === "studios") flush();
      section = sectionMatch[1];
      continue;
    }

    if (section !== "studios") continue;

    const nameMatch = line.match(/^    - name:\s*(.*)$/);
    if (nameMatch) {
      flush();
      current = {
        name: cleanScalar(nameMatch[1]),
        sourceLine: index + 1,
      };
      continue;
    }

    if (!current) continue;
    const fieldMatch = line.match(
      /^      (logo|location|slogan|link):\s*(.*)$/,
    );
    if (!fieldMatch) continue;

    const [, key, rawValue] = fieldMatch;
    const value = cleanScalar(rawValue);

    if (key === "logo") current.logo = value;
    if (key === "location")
      current.location = [current.location, value].filter(Boolean).join(" ");
    if (key === "slogan") current.description = value;
    if (key === "link") current.website = value;
  }

  if (section === "studios") flush();
  for (const record of records) {
    if (
      record.description &&
      record.website &&
      /^https?:\/\//i.test(record.description) &&
      !/^h?https?:\/\//i.test(record.website)
    ) {
      [record.website, record.description] = [
        record.description,
        record.website,
      ];
    }
  }
  return records;
}

export function normalizeWebsite(
  value: string,
): { website: string; domain: string } | null {
  const trimmed = value.trim().replace(/^hhttps:\/\//i, "https://");
  if (!trimmed) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    const domain = url.hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    if (!domain.includes(".")) return null;
    url.hash = "";
    return { website: url.toString(), domain };
  } catch {
    return null;
  }
}

export function locationsFromFlags(value = ""): AgencyLocation[] {
  const flags = value.match(/\p{Regional_Indicator}{2}/gu) ?? [];
  const seen = new Set<string>();

  return flags.flatMap((flag) => {
    const code = String.fromCodePoint(
      ...Array.from(flag, (character) => character.codePointAt(0)! - 127397),
    );
    if (seen.has(code)) return [];
    seen.add(code);
    return [{ code, name: regionNames.of(code) ?? code, flag }];
  });
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function uniqueLocations(records: RawAgency[]): AgencyLocation[] {
  const byCode = new Map<string, AgencyLocation>();
  for (const record of records) {
    for (const location of locationsFromFlags(record.location))
      byCode.set(location.code, location);
  }
  return Array.from(byCode.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}

function stableId(domain: string): string {
  return createHash("sha256").update(domain).digest("hex").slice(0, 16);
}

export function compareAgencyNames(left: string, right: string): number {
  const key = (name: string) =>
    name
      .normalize("NFKD")
      .replace(/^\s*&\s*/, "")
      .replace(/^[^a-z0-9]+/i, "");
  return key(left).localeCompare(key(right), "en", {
    numeric: true,
    sensitivity: "base",
  });
}

export function normalizeAgencies(records: RawAgency[]): {
  agencies: AgencyCandidate[];
  issues: ImportIssue[];
} {
  const issues: ImportIssue[] = [];
  const grouped = new Map<string, RawAgency[]>();

  for (const record of records) {
    if (!record.website) {
      issues.push({
        type: "missing-link",
        sourceLine: record.sourceLine,
        name: record.name,
        detail: "The source record has no official website.",
      });
      continue;
    }

    const normalized = normalizeWebsite(record.website);
    if (!normalized) {
      issues.push({
        type: "invalid-link",
        sourceLine: record.sourceLine,
        name: record.name,
        detail: record.website,
      });
      continue;
    }

    if (profileDomains.has(normalized.domain)) {
      issues.push({
        type: "non-official-link",
        sourceLine: record.sourceLine,
        name: record.name,
        detail: `Third-party profile URL: ${normalized.website}`,
      });
      continue;
    }

    const group = grouped.get(normalized.domain) ?? [];
    group.push({ ...record, website: normalized.website });
    grouped.set(normalized.domain, group);
  }

  const canonical = Array.from(grouped.entries()).map(([domain, group]) => {
    const primary = group[0];
    const aliases = Array.from(
      new Set(
        group
          .slice(1)
          .map((record) => record.name)
          .filter((name) => name !== primary.name),
      ),
    );
    if (group.length > 1) {
      for (const duplicate of group.slice(1)) {
        issues.push({
          type: "duplicate-domain",
          sourceLine: duplicate.sourceLine,
          name: duplicate.name,
          detail: `Merged into ${primary.name} (${domain}).`,
        });
      }
    }

    return {
      domain,
      group,
      primary,
      aliases,
      baseSlug:
        slugify(primary.name) ||
        slugify(domain.split(".")[0]) ||
        stableId(domain),
    };
  });

  const slugCounts = new Map<string, number>();
  for (const entry of canonical)
    slugCounts.set(entry.baseSlug, (slugCounts.get(entry.baseSlug) ?? 0) + 1);

  const agencies = canonical.map(
    ({ domain, group, primary, aliases, baseSlug }) => {
      const discriminator = slugify(domain.split(".")[0]);
      const slug =
        slugCounts.get(baseSlug)! > 1
          ? `${baseSlug}-${discriminator || stableId(domain).slice(0, 6)}`
          : baseSlug;
      const description =
        group.find((record) => record.description)?.description ?? "";

      return {
        id: stableId(domain),
        slug,
        name: primary.name,
        aliases,
        description,
        website: primary.website!,
        officialDomain: domain,
        locations: uniqueLocations(group),
        logo: primary.logo
          ? `/logos/${slug}.${primary.logo.split(".").pop()?.toLowerCase() || "png"}`
          : null,
        screenshot: `/screenshots/${slug}.webp`,
        sourceLines: group.map((record) => record.sourceLine),
      } satisfies AgencyCandidate;
    },
  );

  const usedSlugs = new Set<string>();
  for (const agency of agencies) {
    if (usedSlugs.has(agency.slug)) {
      const previousSlug = agency.slug;
      agency.slug = `${previousSlug}-${agency.id.slice(0, 6)}`;
      agency.screenshot = `/screenshots/${agency.slug}.webp`;
      if (agency.logo)
        agency.logo = agency.logo.replace(
          `/logos/${previousSlug}.`,
          `/logos/${agency.slug}.`,
        );
    }
    usedSlugs.add(agency.slug);
  }
  agencies.sort((a, b) => compareAgencyNames(a.name, b.name));
  return { agencies, issues };
}
