import { describe, expect, it } from "vitest";

import {
  caseStudyId,
  cleanCaseStudyTitle,
  dedupeAcrossAgencies,
  entriesHash,
  extractCaseStudyLinks,
  findWorkPageUrl,
  isReadableTitle,
} from "../scripts/lib/case-studies";

describe("findWorkPageUrl", () => {
  it("finds a work link in the primary navigation", () => {
    const html = `
      <header><nav>
        <a href="/">Home</a>
        <a href="/work">Work</a>
        <a href="/about">About</a>
      </nav></header>
    `;
    expect(findWorkPageUrl(html, "https://example.com/")).toBe(
      "https://example.com/work",
    );
  });

  it("matches labeled links such as case studies or portfolio", () => {
    const html = `<a href="/selected">Selected Work</a>`;
    expect(findWorkPageUrl(html, "https://example.com/")).toBe(
      "https://example.com/selected",
    );
    const cases = `<a href="/cases">Cases</a>`;
    expect(findWorkPageUrl(cases, "https://example.com/")).toBe(
      "https://example.com/cases",
    );
  });

  it("rejects external and non-work links", () => {
    const html = `
      <a href="https://instagram.com/example/work">Work</a>
      <a href="/contact">Contact</a>
      <a href="mailto:hi@example.com">Email</a>
    `;
    expect(findWorkPageUrl(html, "https://example.com/")).toBeNull();
  });

  it("rejects deep or paginated work-looking paths", () => {
    const html = `<a href="/work/page/2">Work</a>`;
    expect(findWorkPageUrl(html, "https://example.com/")).toBeNull();
  });

  it("falls back to the homepage when it lists project entries", () => {
    const html = `
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/projects/acme">Acme</a>
      <a href="/projects/globex">Globex</a>
    `;
    expect(findWorkPageUrl(html, "https://example.com/")).toBe(
      "https://example.com/",
    );
  });
});

describe("extractCaseStudyLinks", () => {
  const workPage = "https://example.com/work";

  it("extracts same-site entries and skips the work page itself", () => {
    const html = `
      <a href="/work">All work</a>
      <a href="/work/acme"><h3>Acme Rebrand</h3></a>
      <a href="/projects/globex">Globex Site</a>
    `;
    const links = extractCaseStudyLinks(html, workPage);
    expect(links.map((link) => link.url)).toEqual([
      "https://example.com/work/acme",
      "https://example.com/projects/globex",
    ]);
    expect(links[0].title).toBe("Acme Rebrand");
  });

  it("ignores navigation, footer, and excluded sections", () => {
    const html = `
      <nav><a href="/work/nav-noise">Nav noise</a></nav>
      <main>
        <a href="/work/real-one">Real one</a>
        <a href="/about">About</a>
        <a href="/blog/post">Blog</a>
        <a href="/work/page/2">Next</a>
      </main>
      <footer><a href="/work/footer-noise">Footer noise</a></footer>
    `;
    const links = extractCaseStudyLinks(html, workPage);
    expect(links.map((link) => link.url)).toEqual([
      "https://example.com/work/real-one",
    ]);
  });

  it("requires nested paths when the work page is the homepage", () => {
    const html = `
      <a href="/archive">Archive</a>
      <a href="/projects/acme">Acme</a>
    `;
    const links = extractCaseStudyLinks(html, "https://example.com/", {
      requireNested: true,
    });
    expect(links.map((link) => link.url)).toEqual([
      "https://example.com/projects/acme",
    ]);
  });

  it("deduplicates by URL and respects the limit", () => {
    const html = `
      <a href="/work/one">One</a>
      <a href="/work/one#top">One again</a>
      <a href="/work/two">Two</a>
      <a href="/work/three">Three</a>
    `;
    const links = extractCaseStudyLinks(html, workPage, { limit: 2 });
    expect(links.map((link) => link.url)).toEqual([
      "https://example.com/work/one",
      "https://example.com/work/two",
    ]);
  });

  it("falls back to image alt text for the title", () => {
    const html = `<a href="/work/one"><img src="x.jpg" alt="One Project"></a>`;
    const links = extractCaseStudyLinks(html, workPage);
    expect(links[0].title).toBe("One Project");
  });

  it("excludes studio, insights, story, and about-us pages", () => {
    const html = `
      <a href="/work/real-one">Real one</a>
      <a href="/studio">Studio</a>
      <a href="/insights">Insights</a>
      <a href="/our-story">Our Story</a>
      <a href="/about-us/team">Team</a>
    `;
    const links = extractCaseStudyLinks(html, workPage);
    expect(links.map((link) => link.url)).toEqual([
      "https://example.com/work/real-one",
    ]);
  });

  it("ignores style and script content inside anchors", () => {
    const html = `
      <a href="/work/one">
        <style>.slide-in-bottom { overflow: hidden; }</style>
        <script>console.log("noise");</script>
        One Project
      </a>
    `;
    const links = extractCaseStudyLinks(html, workPage);
    expect(links[0].title).toBe("One Project");
  });
});

describe("dedupeAcrossAgencies", () => {
  const websites = new Map([
    ["acme", "https://www.acme.com/"],
    ["globex", "https://globex.io/"],
  ]);

  it("keeps the entry whose agency domain matches the case study host", () => {
    const entries = [
      { url: "https://acme.com/work/one", agencySlug: "globex" },
      { url: "https://acme.com/work/one", agencySlug: "acme" },
    ];
    expect(dedupeAcrossAgencies(entries, websites)).toEqual([
      { url: "https://acme.com/work/one", agencySlug: "acme" },
    ]);
  });

  it("keeps the first entry when no agency domain matches", () => {
    const entries = [
      { url: "https://other.com/work/one", agencySlug: "acme" },
      { url: "https://other.com/work/one", agencySlug: "globex" },
    ];
    expect(dedupeAcrossAgencies(entries, websites)).toEqual([
      { url: "https://other.com/work/one", agencySlug: "acme" },
    ]);
  });

  it("leaves unique URLs untouched and preserves order", () => {
    const entries = [
      { url: "https://globex.io/work/b", agencySlug: "globex" },
      { url: "https://acme.com/work/a", agencySlug: "acme" },
    ];
    expect(dedupeAcrossAgencies(entries, websites)).toEqual(entries);
  });
});

describe("cleanCaseStudyTitle", () => {
  it("strips call-to-action noise and trailing arrows", () => {
    expect(cleanCaseStudyTitle("Acme Rebrand View case study")).toBe(
      "Acme Rebrand",
    );
    expect(cleanCaseStudyTitle("Globex →")).toBe("Globex");
    expect(cleanCaseStudyTitle("  Multi\n   line  ")).toBe("Multi line");
  });

  it("cuts SEO site-name suffixes and caps length", () => {
    expect(cleanCaseStudyTitle("Trust Stamp | 10Clouds")).toBe("Trust Stamp");
    const long = `Project ${"word ".repeat(30)}`.trim();
    const cleaned = cleanCaseStudyTitle(long);
    expect(cleaned.length).toBeLessThanOrEqual(91);
    expect(cleaned.endsWith("…")).toBe(true);
  });

  it("collapses verbatim repeated phrases but keeps brand repetitions", () => {
    expect(cleanCaseStudyTitle("Nike - On Air Nike - On Air Nike - On Air")).toBe(
      "Nike - On Air",
    );
    expect(cleanCaseStudyTitle("Samsøe Samsøe")).toBe("Samsøe Samsøe");
  });
});

describe("isReadableTitle", () => {
  it("rejects ASCII art and empty titles", () => {
    expect(isReadableTitle("----=0OOA?>==>=-----")).toBe(false);
    expect(isReadableTitle("A0O06?!!<<?34A008>>>")).toBe(false);
    expect(isReadableTitle("")).toBe(false);
    expect(isReadableTitle("✶ Experience")).toBe(true);
    expect(isReadableTitle("Dublin Dance Festival 2024")).toBe(true);
  });

  it("rejects generic media placeholders", () => {
    expect(isReadableTitle("image")).toBe(false);
    expect(isReadableTitle("Video")).toBe(false);
    expect(isReadableTitle("Images")).toBe(false);
    expect(isReadableTitle("Imagery Studio")).toBe(true);
  });

  it("rejects letter-spaced animation markup", () => {
    expect(isReadableTitle("H u t t e")).toBe(false);
    expect(isReadableTitle("04 W o r l d W o r l d")).toBe(false);
    expect(isReadableTitle("F F E R N")).toBe(false);
    expect(isReadableTitle("Made by James")).toBe(true);
    expect(isReadableTitle("A B C")).toBe(true);
  });
});

describe("hashes", () => {
  it("produces stable ids and order-independent entry hashes", () => {
    expect(caseStudyId("https://example.com/work/one")).toHaveLength(12);
    const left = entriesHash([
      { url: "https://example.com/work/a", title: "A" },
      { url: "https://example.com/work/b", title: "B" },
    ]);
    const right = entriesHash([
      { url: "https://example.com/work/b", title: "B" },
      { url: "https://example.com/work/a", title: "A" },
    ]);
    expect(left).toBe(right);
    expect(
      entriesHash([{ url: "https://example.com/work/c", title: "C" }]),
    ).not.toBe(left);
  });
});
