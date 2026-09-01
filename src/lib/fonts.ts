export const FREE_FONT_PAGE_SIZE = 36;

export const FREE_FONT_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "hei", label: "Sans / 黑体" },
  { value: "kai", label: "Kai / 楷体" },
  { value: "song", label: "Serif / 宋体" },
  { value: "art", label: "Display / 艺术体" },
  { value: "handwriting", label: "Handwritten / 手绘体" },
  { value: "english", label: "English" },
  { value: "open-source", label: "Open source" },
] as const;

export type FreeFontCategory = (typeof FREE_FONT_CATEGORIES)[number]["value"];

export interface FreeFont {
  name: string;
  license: string;
  type: string | null;
  size: string | null;
  familyName: string | null;
  preview: string | null;
  english: boolean;
  openSource: boolean;
}

const FREE_FONT_PUBLIC_BASE = "https://wangchujiang.com/free-font";

export function freeFontPreviewUrl(font: FreeFont) {
  return font.preview
    ? `${FREE_FONT_PUBLIC_BASE}/images/${encodeURIComponent(font.preview)}`
    : null;
}

export function freeFontDetailsUrl(font: FreeFont) {
  return `${FREE_FONT_PUBLIC_BASE}/details/${encodeURIComponent(font.name)}.html`;
}

export function isFreeFontCategory(value: string): value is FreeFontCategory {
  return FREE_FONT_CATEGORIES.some((category) => category.value === value);
}

export function matchesFreeFontCategory(
  font: FreeFont,
  category: FreeFontCategory,
) {
  if (category === "all") return true;
  if (category === "english") return font.english;
  if (category === "open-source") return font.openSource;

  const types: Record<Exclude<FreeFontCategory, "all" | "english" | "open-source">, string> = {
    hei: "黑体",
    kai: "楷体",
    song: "宋体",
    art: "艺术体",
    handwriting: "手绘体",
  };
  return font.type === types[category];
}

export function filterFreeFonts(
  fonts: FreeFont[],
  query: string,
  category: FreeFontCategory,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return fonts.filter((font) => {
    if (!matchesFreeFontCategory(font, category)) return false;
    if (!normalizedQuery) return true;

    return [font.name, font.familyName, font.type, font.license]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}
