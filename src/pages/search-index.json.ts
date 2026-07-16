import { formatLocations, publishedAgencies } from "@/lib/catalog";

export const prerender = true;

export function GET() {
  const items = publishedAgencies.map((agency) => ({
    name: agency.name,
    slug: agency.slug,
    meta: formatLocations(agency),
    searchText: [
      agency.name,
      agency.description,
      agency.aliases.join(" "),
      formatLocations(agency),
    ]
      .join(" ")
      .toLocaleLowerCase(),
  }));

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
