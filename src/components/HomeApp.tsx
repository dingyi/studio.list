import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Grid2X2,
  List,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AgencySearch, {
  type AgencySearchItem,
} from "@/components/AgencySearch";
import PageHeader from "@/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Agency } from "@/lib/catalog";
import { formatLocations } from "@/lib/catalog";
import {
  clampPage,
  filterAgencies,
  PAGE_SIZE,
  pageWindow,
} from "@/lib/directory";

interface Props {
  agencies: Agency[];
}

type View = "card" | "list";

function AgencyCard({ agency, view }: { agency: Agency; view: View }) {
  return (
    <article className={`agency-card agency-card--${view}`}>
      <a
        className="agency-card__main"
        href={`/agencies/${agency.slug}/`}
        aria-label={`View ${agency.name}`}
      >
        <div className="agency-card__media">
          <img
            src={agency.screenshot}
            alt={`${agency.name} website homepage`}
            loading="lazy"
            width="1440"
            height="900"
          />
        </div>
        <div className="agency-card__body">
          <div>
            <h2>{agency.name}</h2>
            <p className="agency-card__location">{formatLocations(agency)}</p>
          </div>
          {view === "list" && agency.description && (
            <p className="agency-card__description">{agency.description}</p>
          )}
        </div>
      </a>
      <a
        className="agency-card__external"
        href={agency.website}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${agency.name} website in a new tab`}
      >
        <ExternalLink size={17} aria-hidden="true" />
      </a>
    </article>
  );
}

export default function HomeApp({ agencies }: Props) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [view, setView] = useState<View>("card");
  const [viewInUrl, setViewInUrl] = useState(false);
  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const countries = useMemo(() => {
    const entries = new Map<string, { name: string; flag: string }>();
    for (const agency of agencies)
      for (const location of agency.locations)
        entries.set(location.code, location);
    return Array.from(entries, ([code, location]) => ({
      code,
      ...location,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [agencies]);
  const searchItems = useMemo<AgencySearchItem[]>(
    () =>
      agencies.map((agency) => ({
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
      })),
    [agencies],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedView = window.localStorage.getItem("studio-list-view");
    setQuery(params.get("q") ?? "");
    setCountry(params.get("country") ?? "all");
    setView(
      params.get("view") === "list" ||
        (!params.has("view") && storedView === "list")
        ? "list"
        : "card",
    );
    setViewInUrl(params.has("view"));
    setPage(Number(params.get("page") ?? 1));
    setSearchOpen(params.get("search") === "1");
    setReady(true);
  }, []);

  const filtered = useMemo(
    () => filterAgencies(agencies, query, country),
    [agencies, query, country],
  );
  const currentPage = clampPage(page, filtered.length);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const selectedCountry = countries.find((item) => item.code === country)?.name;
  const emptyContext = [
    query ? `“${query}”` : null,
    country !== "all" ? selectedCountry : null,
  ]
    .filter(Boolean)
    .join(" in ");

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (country !== "all") params.set("country", country);
    if (viewInUrl) params.set("view", view);
    if (currentPage > 1) params.set("page", String(currentPage));
    const queryString = params.toString();
    window.history.replaceState(
      {},
      "",
      queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname,
    );
    window.localStorage.setItem("studio-list-view", view);
  }, [country, currentPage, query, ready, view, viewInUrl]);

  function choosePage(next: number) {
    setPage(next);
    document
      .querySelector<HTMLElement>("#directory-title")
      ?.focus({ preventScroll: true });
    document
      .querySelector("#directory")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <PageHeader
        active="discover"
        homeSearch
        onSearch={() => setSearchOpen(true)}
      />
      <main data-directory-ready={ready}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__inner">
            <h1 id="hero-title">
              Discover remarkable, independent design agencies
            </h1>
            <p className="hero__copy">
              Subscribe for a weekly edit of remarkable studios shaping
              brands, products, and culture.
            </p>
            <form
              className="hero__subscribe"
              aria-label="Newsletter subscription"
              onSubmit={(event) => {
                event.preventDefault();
                setNewsletterOpen(true);
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Newsletter email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@email.com"
                required
                aria-label="Newsletter email address"
              />
              <button
                type="submit"
                aria-label="Subscribe to the studio.list newsletter"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

        <section
          className="directory"
          id="directory"
          aria-labelledby="directory-title"
        >
          <div className="directory-toolbar">
            <div>
              <p className="eyebrow" id="directory-title" tabIndex={-1}>
                Directory
              </p>
              <p className="result-count">{filtered.length} agencies</p>
            </div>
            <div className="directory-controls">
              <Select
                value={country}
                onValueChange={(value) => {
                  setCountry(value ?? "all");
                  setPage(1);
                }}
              >
                <SelectTrigger
                  className="country-select"
                  aria-label="Filter by country"
                >
                  <SelectValue>
                    {country === "all"
                      ? "All countries"
                      : countries.find((item) => item.code === country)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countries.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.flag} {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div
                className="view-switch"
                role="group"
                aria-label="Directory layout"
              >
                <button
                  className={view === "card" ? "is-active" : ""}
                  type="button"
                  onClick={() => {
                    setView("card");
                    setViewInUrl(true);
                  }}
                  aria-label="Card view"
                  aria-pressed={view === "card"}
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  className={view === "list" ? "is-active" : ""}
                  type="button"
                  onClick={() => {
                    setView("list");
                    setViewInUrl(true);
                  }}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </div>

          {visible.length ? (
            <div className={`agency-grid agency-grid--${view}`}>
              {visible.map((agency) => (
                <AgencyCard agency={agency} view={view} key={agency.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No agencies found.</h2>
              <p>
                No results for {emptyContext || "the current filters"}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCountry("all");
                  setPage(1);
                }}
              >
                Reset filters
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Directory pages">
              <button
                type="button"
                onClick={() => choosePage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ArrowLeft size={16} />
              </button>
              {pageWindow(currentPage, totalPages).map(
                (value, index, values) => (
                  <span key={value} className="pagination__item">
                    {index > 0 && value - values[index - 1] > 1 && (
                      <span className="pagination__ellipsis">…</span>
                    )}
                    <button
                      className={currentPage === value ? "is-active" : ""}
                      type="button"
                      onClick={() => choosePage(value)}
                      aria-current={currentPage === value ? "page" : undefined}
                    >
                      {value}
                    </button>
                  </span>
                ),
              )}
              <button
                type="button"
                onClick={() => choosePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ArrowRight size={16} />
              </button>
            </nav>
          )}
        </section>
      </main>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="search-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">Search agencies</DialogTitle>
          <AgencySearch
            items={searchItems}
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            onClose={() => setSearchOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={newsletterOpen} onOpenChange={setNewsletterOpen}>
        <DialogContent className="notice-dialog">
          <DialogTitle>Subscriptions are opening soon.</DialogTitle>
          <DialogDescription>
            The weekly studio.list edit is still being prepared. Your email
            has not been stored or sent anywhere.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
