import { describe, expect, it } from "vitest";

import {
  filterFreeFonts,
  matchesFreeFontCategory,
  type FreeFont,
} from "../src/lib/fonts";

const font = (overrides: Partial<FreeFont>): FreeFont => ({
  name: "Example Sans",
  license: "商免",
  type: "黑体",
  size: "1 MB",
  familyName: "Example",
  preview: null,
  english: false,
  openSource: false,
  ...overrides,
});

describe("free font directory", () => {
  it("maps source types and path-based English fonts to categories", () => {
    expect(matchesFreeFontCategory(font({}), "hei")).toBe(true);
    expect(
      matchesFreeFontCategory(
        font({ english: true, type: null }),
        "english",
      ),
    ).toBe(true);
  });

  it("matches the upstream open-source category rule", () => {
    expect(
      matchesFreeFontCategory(
        font({ openSource: true }),
        "open-source",
      ),
    ).toBe(true);
    expect(matchesFreeFontCategory(font({}), "open-source")).toBe(false);
  });

  it("searches names and metadata within the selected category", () => {
    const fonts = [
      font({}),
      font({ name: "Brush One", type: "手绘体", license: "OFL-1.1" }),
    ];

    expect(filterFreeFonts(fonts, "brush", "all")).toHaveLength(1);
    expect(filterFreeFonts(fonts, "ofl", "handwriting")).toHaveLength(1);
    expect(filterFreeFonts(fonts, "brush", "hei")).toHaveLength(0);
  });
});
