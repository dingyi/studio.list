import { publishedAgencies } from "@/lib/catalog";
import { withBase } from "@/lib/paths";

export const GET = () => {
  const site = (import.meta.env.SITE || "https://studio.list").replace(/\/$/, "");
  const paths = [
    "/",
    "/work/",
    "/about/",
    ...publishedAgencies.map((agency) => `/agencies/${agency.slug}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `\n  <url><loc>${site}${withBase(path)}</loc></url>`).join("")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
