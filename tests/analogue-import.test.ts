import { existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import agencies from "../src/data/agencies.json";
import cases from "../src/data/case-studies.json";
import manifest from "../src/data/case-study-manifest.json";
import source from "./fixtures/analogue-case-studies.json";
import { caseStudyId, entriesHash } from "../scripts/lib/case-studies";

const entries = cases.filter((entry) => entry.agencySlug === source.agencySlug);

describe("Analogue complete portfolio curation", () => {
  it("uses the existing canonical agency", () => {
    const matches = agencies.filter((agency) => agency.officialDomain === "analogueagency.com");
    expect(matches).toHaveLength(1);
    expect(matches[0].slug).toBe(source.agencySlug);
    expect(matches[0].id).toBe("3802799ed9fef8e8");
  });

  it("accounts for every public case and the unpublished cards", () => {
    expect(source.overviewCards).toBe(39);
    expect(source.publishedCases).toHaveLength(31);
    expect(source.unpublishedCards).toHaveLength(9);
    expect(entries.map((entry) => entry.url).sort()).toEqual(
      source.publishedCases.map((entry) => entry.url).sort(),
    );
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(31);
    expect(manifest["analogue-agency"].status).toBe("success");
    expect(manifest["analogue-agency"].entriesHash).toBe(entriesHash(source.publishedCases));
  });

  it("uses URL-derived IDs and authentic 1440x900 WebP captures", async () => {
    for (const entry of entries) {
      expect(entry.id).toBe(caseStudyId(entry.url));
      expect(entry.image).toBe(`/case-studies/analogue-agency/${entry.id}.webp`);
      const path = resolve("public", entry.image.slice(1));
      expect(existsSync(path), entry.title).toBe(true);
      const metadata = await sharp(path).metadata();
      expect([metadata.width, metadata.height, metadata.format]).toEqual([1440, 900, "webp"]);
    }
  });

  it("keeps the verified product link and excludes about/WIP/coming-soon pages", () => {
    expect(entries.some((entry) => entry.url === "https://af1.analogueshop.com/")).toBe(true);
    expect(entries.some((entry) => entry.url === source.removedNonCase)).toBe(false);
    for (const item of source.unpublishedCards) {
      if (item.url) expect(entries.some((entry) => entry.url === item.url)).toBe(false);
    }
    expect(entries.find((entry) => entry.url.endsWith("/vitra"))!.capturedAt).toBe("2026-08-17T10:55:49.581Z");
  });
});
