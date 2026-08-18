import agenciesData from "../data/agencies.json";
import manifestData from "../data/screenshot-manifest.json";

export interface AgencyLocation {
  code: string;
  name: string;
  flag: string;
}

export interface Agency {
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

interface ScreenshotEntry {
  status: "success" | "review" | "failed";
  path?: string;
}

const manifest = manifestData as Record<string, ScreenshotEntry>;

export const allAgencies = agenciesData as Agency[];
export const publishedAgencies = allAgencies.filter(
  (agency) => manifest[agency.slug]?.status === "success",
);

export function countryFlagPath(code: string) {
  return `/flags/${code.toLocaleLowerCase()}.svg`;
}

export function formatLocations(agency: Agency) {
  return agency.locations.length
    ? agency.locations
        .map((location) => location.name)
        .join(" · ")
    : "Location not listed";
}

const similarityStopWords = new Set([
  "about",
  "agency",
  "also",
  "and",
  "are",
  "based",
  "for",
  "from",
  "into",
  "our",
  "studio",
  "that",
  "the",
  "their",
  "this",
  "through",
  "with",
  "your",
]);

function descriptionTerms(agency: Agency) {
  return new Set(
    (agency.description.toLocaleLowerCase().match(/[a-z0-9]+/g) ?? [])
      .filter((term) => term.length > 2 && !similarityStopWords.has(term)),
  );
}

export function getSimilarAgencies(
  current: Agency,
  candidates: Agency[] = publishedAgencies,
  limit = 4,
) {
  const currentCountries = new Set(
    current.locations.map((location) => location.code),
  );
  const currentTerms = descriptionTerms(current);

  return candidates
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => {
      const sharedCountries = candidate.locations.filter((location) =>
        currentCountries.has(location.code),
      ).length;
      const sharedTerms = [...descriptionTerms(candidate)].filter((term) =>
        currentTerms.has(term),
      ).length;

      return {
        agency: candidate,
        score: sharedCountries * 100 + sharedTerms * 4,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.agency.name.localeCompare(right.agency.name),
    )
    .slice(0, Math.max(0, limit))
    .map(({ agency }) => agency);
}
