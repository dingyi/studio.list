import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import agencies from "../src/data/agencies.json";
import manifest from "../src/data/screenshot-manifest.json";

describe("HOLM studio curation", () => {
  it("has one canonical identity for byholm.co", () => {
    const matches = agencies.filter((agency) => agency.officialDomain === "byholm.co");
    expect(matches).toHaveLength(1);
    const agency = matches[0];
    expect(agency.slug).toBe("holm");
    expect(agency.name).toBe("HOLM");
    expect(agency.id).toBe(createHash("sha256").update("byholm.co").digest("hex").slice(0, 16));
    expect(new URL(agency.website).hostname).toBe(agency.officialDomain);
  });

  it("accurately represents the one-person studio and official location", () => {
    const agency = agencies.find((item) => item.slug === "holm")!;
    expect(agency.description).toContain("one-person studio");
    expect(agency.locations).toEqual([{ code: "TR", name: "Türkiye", flag: "🇹🇷" }]);
    expect(existsSync(resolve("public/flags/tr.svg"))).toBe(true);
    expect(agencies.find((item) => item.slug === "holman-design")!.officialDomain).not.toBe(agency.officialDomain);
  });

  it("publishes only a reviewed official desktop capture", async () => {
    const entry = (manifest as Record<string, {
      status: string; path?: string; finalUrl?: string;
    }>)["holm"];
    expect(entry.status).toBe("success");
    expect(entry.path).toBe("/screenshots/holm.webp");
    expect(new URL(entry.finalUrl!).hostname).toBe("byholm.co");
    const metadata = await sharp(resolve("public", entry.path!.slice(1))).metadata();
    expect([metadata.width, metadata.height, metadata.format]).toEqual([1440, 900, "webp"]);
  });
});
