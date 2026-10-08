import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import agencies from "../src/data/agencies.json";
import manifest from "../src/data/screenshot-manifest.json";
import source from "./fixtures/motionimo-studios.json";
import { publishedAgencies } from "../src/lib/catalog";

describe("Motionimo studio curation", () => {
  it("accounts for every studio in the checked source snapshot", () => {
    expect(source.studios).toHaveLength(126);
    expect(new Set(source.studios.map((studio) => studio.name)).size).toBe(126);
    for (const studio of source.studios) {
      expect(agencies.filter((agency) => agency.slug === studio.agencySlug), studio.name).toHaveLength(1);
    }
  });

  it("keeps stable, unique canonical identities", () => {
    for (const field of ["id", "slug", "officialDomain"] as const) {
      expect(new Set(agencies.map((agency) => agency[field])).size).toBe(agencies.length);
    }
    for (const studio of source.studios) {
      const agency = agencies.find((item) => item.slug === studio.agencySlug)!;
      expect(new URL(agency.website).hostname.replace(/^www\./, "")).toBe(agency.officialDomain);
      expect(agency.website).not.toMatch(/shorturl\.at|forsale\.godaddy\.com|motionimo\.xyz/);
    }
  });

  it("keeps unverified captures out of the published directory", () => {
    const entries = manifest as Record<string, { status: string; path?: string; error?: string }>;
    for (const studio of source.studios) {
      const agency = agencies.find((item) => item.slug === studio.agencySlug)!;
      const entry = entries[agency.slug];
      expect(entry, studio.name).toBeDefined();
      if (entry.status === "success") {
        expect(entry.path).toBe(agency.screenshot);
        expect(existsSync(resolve(process.cwd(), "public", agency.screenshot.slice(1)))).toBe(true);
      } else {
        expect(publishedAgencies.some((item) => item.slug === agency.slug)).toBe(false);
      }
    }
  });

  it("separates Landscape from Lance and links Workbench to its actual studio", () => {
    const landscape = agencies.find((agency) => agency.slug === "landscape")!;
    expect(landscape.officialDomain).toBe("thisislandscape.com");
    expect(agencies.find((agency) => agency.slug === "lance")!.aliases).not.toContain("Landscape");
    expect(source.studios.find((studio) => studio.name === "Workbench")!.agencySlug).toBe("yellow-dog-party");
    expect(agencies.find((agency) => agency.slug === "yellow-dog-party")!.officialDomain).toBe("yellowdogparty.com");
    expect(agencies.some((agency) => agency.officialDomain === "workbench.tv")).toBe(false);
  });
});
