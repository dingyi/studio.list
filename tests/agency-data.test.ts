import { describe, expect, it } from "vitest";

import {
  cleanScalar,
  compareAgencyNames,
  locationsFromFlags,
  normalizeAgencies,
  normalizeWebsite,
  parseStudiosYaml,
  slugify,
} from "../scripts/lib/agency-data";

describe("agency data normalization", () => {
  it("parses only the studios section and tolerates an unclosed quote", () => {
    const source = `- id: studios
  name: design studios
  items:
    - name: 'An Audience of One
      logo: './images/agency/AAO.png'
      location: '🇪🇸'
      slogan: 'Take it personal'
      link: 'https://anaudienceofone.co/'
- id: designers
  items:
    - name: 'Ignored Person'
      link: 'https://example.com/'`;

    expect(parseStudiosYaml(source)).toEqual([
      {
        name: "An Audience of One",
        logo: "./images/agency/AAO.png",
        location: "🇪🇸",
        description: "Take it personal",
        website: "https://anaudienceofone.co/",
        sourceLine: 4,
      },
    ]);
  });

  it("normalizes domains and preserves a usable URL", () => {
    expect(normalizeWebsite("https://www.Example.com/path/#team")).toEqual({
      website: "https://www.example.com/path/",
      domain: "example.com",
    });
    expect(normalizeWebsite("hhttps://non-linear.studio/")).toEqual({
      website: "https://non-linear.studio/",
      domain: "non-linear.studio",
    });
  });

  it("repairs a source row whose slogan and link were swapped", () => {
    const source = `- id: studios
  items:
    - name: 'Special Projects'
      slogan: 'https://s-p.studio/'
      link: 'We make useful things.'`;

    expect(parseStudiosYaml(source)[0]).toMatchObject({
      description: "We make useful things.",
      website: "https://s-p.studio/",
    });
  });

  it("keeps repeated location fields from malformed source YAML", () => {
    const source = `- id: studios
  items:
    - name: 'Two Places'
      location: '🇳🇴'
      location: '🇺🇸'
      link: 'https://example.com/'`;

    expect(parseStudiosYaml(source)[0].location).toBe("🇳🇴 🇺🇸");
  });

  it("converts emoji flags into accessible locations", () => {
    expect(locationsFromFlags("🇺🇸 🇳🇱")).toEqual([
      { code: "US", name: "United States", flag: "🇺🇸" },
      { code: "NL", name: "Netherlands", flag: "🇳🇱" },
    ]);
  });

  it("merges duplicate official domains and keeps aliases", () => {
    const { agencies, issues } = normalizeAgencies([
      {
        name: "Primary",
        website: "https://example.com",
        location: "🇺🇸",
        sourceLine: 1,
      },
      {
        name: "Alias",
        website: "https://www.example.com/",
        location: "🇳🇱",
        sourceLine: 2,
      },
    ]);

    expect(agencies).toHaveLength(1);
    expect(agencies[0].aliases).toEqual(["Alias"]);
    expect(agencies[0].locations.map((location) => location.code)).toEqual([
      "NL",
      "US",
    ]);
    expect(issues[0].type).toBe("duplicate-domain");
  });

  it("does not treat a social portfolio profile as an official domain", () => {
    const { agencies, issues } = normalizeAgencies([
      {
        name: "Profile only",
        website: "https://behance.net/profile",
        sourceLine: 1,
      },
    ]);
    expect(agencies).toHaveLength(0);
    expect(issues[0].type).toBe("non-official-link");
  });

  it("creates readable slugs and cleans YAML scalars", () => {
    expect(slugify("A Friend of Mine")).toBe("a-friend-of-mine");
    expect(cleanScalar("'We''re here'")).toBe("We're here");
  });

  it("sorts numeric names before letters and ignores a leading ampersand", () => {
    expect(["&Walsh", "10Clouds", "Aino"].sort(compareAgencyNames)).toEqual([
      "10Clouds",
      "Aino",
      "&Walsh",
    ]);
  });

  it("creates unique slugs when agencies share a name and domain prefix", () => {
    const { agencies } = normalizeAgencies([
      { name: "Shared Name", website: "https://studio.com", sourceLine: 1 },
      { name: "Shared Name", website: "https://studio.design", sourceLine: 2 },
    ]);
    expect(new Set(agencies.map((agency) => agency.slug)).size).toBe(2);
  });
});
