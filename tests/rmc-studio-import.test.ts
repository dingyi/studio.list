import { createHash } from "node:crypto";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import agencies from "../src/data/agencies.json";
import manifest from "../src/data/screenshot-manifest.json";

describe("Rmc.Studio curation", () => {
  it("keeps Rmc.Studio and READYMAGIC as one canonical agency", () => {
    const matches = agencies.filter((agency) => agency.officialDomain === "rmc-studio.com");
    expect(matches).toHaveLength(1);
    expect(matches[0].slug).toBe("rmc-studio");
    expect(matches[0].name).toBe("Rmc.Studio");
    expect(matches[0].aliases).toContain("READYMAGIC");
    expect(matches[0].id).toBe(createHash("sha256").update("rmc-studio.com").digest("hex").slice(0, 16));
    expect(new URL(matches[0].website).hostname).toBe(matches[0].officialDomain);
  });

  it("preserves the official summary without inventing a location or logo", () => {
    const agency = agencies.find((item) => item.slug === "rmc-studio")!;
    expect(agency.description).toBe("We build landing pages, corporate websites, & e-commerce stores using Readymag.");
    expect(agency.locations).toEqual([]);
    expect(agency.logo).toBeNull();
  });

  it("uses a reviewed official 1440x900 WebP capture", async () => {
    const entry = (manifest as Record<string, { status: string; path?: string; finalUrl?: string }>)["rmc-studio"];
    expect(entry.status).toBe("success");
    expect(entry.path).toBe("/screenshots/rmc-studio.webp");
    expect(new URL(entry.finalUrl!).hostname).toBe("rmc-studio.com");
    const metadata = await sharp(resolve("public", entry.path!.slice(1))).metadata();
    expect([metadata.width, metadata.height, metadata.format]).toEqual([1440, 900, "webp"]);
  });
});
