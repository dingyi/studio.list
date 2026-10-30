import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import agencies from "../src/data/agencies.json";
import manifest from "../src/data/screenshot-manifest.json";
import source from "./fixtures/longlist-studios.json";
import { publishedAgencies } from "../src/lib/catalog";

describe("Longlist studio curation", () => {
  it("accounts for all 978 studio profiles, not just the initial page", () => {
    expect(source.studios).toHaveLength(source.expectedStudios);
    expect(source.expectedStudios).toBe(978);
    expect(new Set(source.studios.map((item) => item.sourceUrl)).size).toBe(978);
    for (const item of source.studios) {
      expect(agencies.filter((agency) => agency.slug === item.agencySlug), item.sourceUrl).toHaveLength(1);
    }
    expect(new Set(source.studios.filter((item) => item.match === "added").map((item) => item.agencySlug)).size).toBe(598);
  });

  it("keeps canonical identities unique and country assets available", () => {
    for (const field of ["id", "slug", "officialDomain"] as const) {
      expect(new Set(agencies.map((agency) => agency[field])).size).toBe(agencies.length);
    }
    for (const item of source.studios) {
      const agency = agencies.find((agency) => agency.slug === item.agencySlug)!;
      expect(new URL(agency.website).hostname.replace(/^www\./, "")).toBe(agency.officialDomain);
      for (const location of agency.locations) {
        expect(existsSync(resolve("public/flags", location.code.toLowerCase() + ".svg")), agency.slug).toBe(true);
      }
    }
  });

  it("publishes only reviewed, available previews", () => {
    const entries = manifest as Record<string, { status: string; path?: string; finalUrl?: string }>;
    for (const item of source.studios) {
      const agency = agencies.find((agency) => agency.slug === item.agencySlug)!;
      const entry = entries[agency.slug];
      expect(entry, agency.slug).toBeDefined();
      if (entry.status === "success") {
        expect(entry.path).toBe(agency.screenshot);
        expect(existsSync(resolve("public", agency.screenshot.slice(1))), agency.slug).toBe(true);
        if (item.match === "added") {
          const allowedDomains = new Set([
            agency.officialDomain,
            ...source.studios.filter((row) => row.agencySlug === agency.slug)
              .map((row) => new URL(row.website).hostname.replace(/^www\./, "")),
          ]);
          expect(allowedDomains.has(new URL(entry.finalUrl!).hostname.replace(/^www\./, "")), agency.slug).toBe(true);
        }
      } else {
        expect(publishedAgencies.some((record) => record.slug === agency.slug)).toBe(false);
      }
    }
  });

  it("merges mirrors while preserving different studios with similar names", () => {
    const slugFor = (domain: string) => source.studios.find((item) => new URL(item.website).hostname.replace(/^www\./, "") === domain)!.agencySlug;
    for (const [a, b] of [
      ["andstudio.lt", "byandstudio.com"],
      ["newmaterial.co", "newmaterial.ai"],
      ["kontrapunkt.dk", "kontrapunkt.com"],
      ["happy.fb.se", "happy.forsman.com"],
      ["primaryworks.com.au", "primary.works"],
    ]) expect(slugFor(a)).toBe(slugFor(b));
    for (const [added, existing] of [
      ["bone-studio", "bone"],
      ["landscape-productions", "landscape"],
      ["off-brand-studio", "off-brand"],
      ["watson-nyc", "watson"],
      ["frost-collective", "frost"],
    ]) {
      expect(agencies.find((item) => item.slug === added)!.officialDomain).not.toBe(
        agencies.find((item) => item.slug === existing)!.officialDomain,
      );
    }
  });

  it("preserves the three pre-existing local additions", () => {
    for (const slug of ["sunday", "saxon-campbell", "maria-vareva"]) {
      expect(agencies.filter((item) => item.slug === slug)).toHaveLength(1);
      expect((manifest as Record<string, { status: string }>)[slug].status).toBe("success");
    }
  });

  it("does not treat an unrelated search-engine redirect as a verified studio", () => {
    expect(agencies.find((item) => item.slug === "hello-comrade")!.officialDomain).toBe("hellocomradestudio.com");
    expect(publishedAgencies.some((item) => item.slug === "hello-comrade")).toBe(false);
  });
});
