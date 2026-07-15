import { describe, expect, it } from "vitest";

import type { Agency } from "../src/lib/catalog";
import { clampPage, filterAgencies, pageWindow } from "../src/lib/directory";

const agency = (overrides: Partial<Agency>): Agency => ({
  id: "1",
  slug: "example",
  name: "Example Studio",
  aliases: [],
  description: "Brand design",
  website: "https://example.com/",
  officialDomain: "example.com",
  locations: [{ code: "US", name: "United States", flag: "🇺🇸" }],
  logo: null,
  screenshot: "/screenshots/example.webp",
  sourceLines: [1],
  ...overrides,
});

describe("directory helpers", () => {
  it("filters by search text and a single country", () => {
    const agencies = [
      agency({}),
      agency({ id: "2", name: "North", locations: [] }),
    ];
    expect(filterAgencies(agencies, "brand", "US")).toHaveLength(1);
    expect(filterAgencies(agencies, "north", "all")[0].name).toBe("North");
  });

  it("limits keyword search to agency names and descriptions", () => {
    const agencies = [
      agency({ aliases: ["Hidden alias"], officialDomain: "secret.test" }),
    ];

    expect(filterAgencies(agencies, "hidden", "all")).toHaveLength(0);
    expect(filterAgencies(agencies, "secret.test", "all")).toHaveLength(0);
    expect(filterAgencies(agencies, "example", "all")).toHaveLength(1);
  });

  it("keeps pagination in range and produces a compact page window", () => {
    expect(clampPage(9, 40)).toBe(2);
    expect(clampPage(-1, 0)).toBe(1);
    expect(pageWindow(5, 10)).toEqual([1, 4, 5, 6, 10]);
  });
});
