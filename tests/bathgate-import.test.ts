import { existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import agencies from "../src/data/agencies.json";
import cases from "../src/data/case-studies.json";
import manifest from "../src/data/case-study-manifest.json";
import source from "./fixtures/bathgate-case-studies.json";
import { caseStudyId, entriesHash } from "../scripts/lib/case-studies";

const entries = cases.filter((entry) => entry.agencySlug === source.agencySlug);

describe("Bathgate complete portfolio curation", () => {
  it("reuses the existing canonical agency", () => {
    const matches = agencies.filter((agency) => agency.officialDomain === "bathgate.design");
    expect(matches).toHaveLength(1);
    expect(matches[0].slug).toBe(source.agencySlug);
    expect(matches[0].id).toBe("2d88c6cc871718ce");
  });

  it("includes all 14 projects without duplicating Grid and Index views", () => {
    expect(source.viewsChecked).toEqual(["Grid", "Index"]);
    expect(source.cases).toHaveLength(14);
    expect(entries).toHaveLength(14);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(14);
    expect(entries.map((entry) => entry.url).sort()).toEqual(source.cases.map((entry) => entry.url).sort());
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/bathgate\.design\/work\/[^/#]+$/);
      expect(entry.title).toBe(source.cases.find((item) => item.url === entry.url)!.title);
    }
  });

  it("uses stable case IDs and reviewed desktop WebP previews", async () => {
    for (const entry of entries) {
      expect(entry.id).toBe(caseStudyId(entry.url));
      expect(entry.image).toBe(`/case-studies/bathgate-design/${entry.id}.webp`);
      const path = resolve("public", entry.image.slice(1));
      expect(existsSync(path), entry.title).toBe(true);
      const metadata = await sharp(path).metadata();
      expect([metadata.width, metadata.height, metadata.format]).toEqual([1440, 900, "webp"]);
    }
  });

  it("records the complete source hash", () => {
    const entry = (manifest as Record<string, {
      status: string;
      workPageUrl?: string;
      entriesHash?: string;
      captureViewports?: Record<string, { url: string; scrollY: number; mediaTop: number }>;
    }>)[source.agencySlug];
    expect(entry.status).toBe("success");
    expect(entry.workPageUrl).toBe(source.source);
    expect(entry.entriesHash).toBe(entriesHash(source.cases));
    expect(Object.keys(entry.captureViewports ?? {})).toHaveLength(14);
    for (const item of entries) {
      const viewport = entry.captureViewports![item.id];
      expect(viewport.url).toBe(item.url);
      expect(viewport.scrollY).toBeGreaterThanOrEqual(0);
      expect(Math.abs(viewport.mediaTop - viewport.scrollY - 60)).toBeLessThan(2);
    }
  });
});
