import agenciesData from "@/data/agencies.json";
import manifestData from "@/data/screenshot-manifest.json";

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

export function formatLocations(agency: Agency) {
  return agency.locations.length
    ? agency.locations
        .map((location) => `${location.flag} ${location.name}`)
        .join(" · ")
    : "Location not listed";
}
