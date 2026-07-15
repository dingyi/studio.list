import type { Agency } from "@/lib/catalog";

export const PAGE_SIZE = 36;

export function filterAgencies(
  agencies: Agency[],
  query: string,
  country: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  return agencies.filter((agency) => {
    const matchesCountry =
      country === "all" ||
      agency.locations.some((location) => location.code === country);
    const searchText = [agency.name, agency.description]
      .join(" ")
      .toLocaleLowerCase("en");
    return (
      matchesCountry &&
      (!normalizedQuery || searchText.includes(normalizedQuery))
    );
  });
}

export function clampPage(page: number, totalItems: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  return Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
}

export function pageWindow(current: number, total: number) {
  const values = new Set([1, total, current - 1, current, current + 1]);
  return Array.from(values)
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);
}
