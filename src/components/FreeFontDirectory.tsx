import { ArrowLeft, ArrowRight, ExternalLink, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { clampPage, pageWindow } from "@/lib/directory";
import {
  filterFreeFonts,
  freeFontDetailsUrl,
  freeFontPreviewUrl,
  FREE_FONT_CATEGORIES,
  FREE_FONT_PAGE_SIZE,
  isFreeFontCategory,
  type FreeFont,
  type FreeFontCategory,
} from "@/lib/fonts";

interface Props {
  fonts: FreeFont[];
}

function FontCard({ font }: { font: FreeFont }) {
  const preview = freeFontPreviewUrl(font);

  return (
    <article className="free-font-card">
      <a
        className="free-font-card__main"
        href={freeFontDetailsUrl(font)}
        target="_blank"
        rel="noreferrer"
        aria-label={`View and download ${font.name}`}
      >
        <div className="free-font-card__preview">
          <span className="free-font-card__preview-fallback" aria-hidden="true">
            {font.name}
          </span>
          {preview && (
            <img
              src={preview}
              alt={`${font.name} font preview`}
              loading="lazy"
              width="420"
              height="180"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
        <div className="free-font-card__body">
          <div className="free-font-card__identity">
            <h2>{font.name}</h2>
            {font.familyName && font.familyName !== font.name && (
              <p>{font.familyName}</p>
            )}
          </div>
          <div className="free-font-card__meta" aria-label="Font details">
            <span>{font.license}</span>
            {font.size && <span>{font.size}</span>}
          </div>
        </div>
        <span className="free-font-card__action">
          View &amp; download
          <ExternalLink size={13} aria-hidden="true" />
        </span>
      </a>
    </article>
  );
}

export default function FreeFontDirectory({ fonts }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FreeFontCategory>("all");
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextCategory = params.get("category") ?? "all";
    setQuery(params.get("q") ?? "");
    setCategory(isFreeFontCategory(nextCategory) ? nextCategory : "all");
    setPage(Number(params.get("page") ?? 1));
    setReady(true);
  }, []);

  const filtered = useMemo(
    () => filterFreeFonts(fonts, query, category),
    [category, fonts, query],
  );
  const currentPage = clampPage(page, filtered.length);
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / FREE_FONT_PAGE_SIZE),
  );
  const visible = filtered.slice(
    (currentPage - 1) * FREE_FONT_PAGE_SIZE,
    currentPage * FREE_FONT_PAGE_SIZE,
  );

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "all") params.set("category", category);
    if (currentPage > 1) params.set("page", String(currentPage));
    const queryString = params.toString();
    window.history.replaceState(
      window.history.state ?? {},
      "",
      queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname,
    );
  }, [category, currentPage, query, ready]);

  function choosePage(next: number) {
    setPage(next);
    document
      .querySelector("#free-font-directory")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setPage(1);
  }

  return (
    <main data-font-directory-ready={ready}>
      <section className="free-font-hero" aria-labelledby="free-font-title">
        <div className="free-font-hero__inner">
          <p className="eyebrow">Type resources</p>
          <h1 id="free-font-title">Free fonts for thoughtful work</h1>
          <p>
            Browse commercial-use and open-source Chinese and English fonts,
            indexed from the community-maintained Free Font collection.
          </p>
          <p className="free-font-hero__note">
            Licenses can change. Review each font&apos;s original terms before
            commercial use.
          </p>
        </div>
      </section>

      <section
        className="free-font-directory"
        id="free-font-directory"
        aria-labelledby="free-font-directory-title"
      >
        <div className="free-font-toolbar">
          <div>
            <p
              className="eyebrow"
              id="free-font-directory-title"
              tabIndex={-1}
            >
              Font library
            </p>
            <p className="result-count" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "font" : "fonts"}
            </p>
          </div>
          <label className="free-font-search">
            <span className="sr-only">Search fonts</span>
            <Search size={15} strokeWidth={1.8} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search fonts"
              aria-label="Search fonts"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear font search"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </label>
        </div>

        <div className="free-font-categories" aria-label="Font categories">
          {FREE_FONT_CATEGORIES.map((item) => (
            <button
              className={category === item.value ? "is-active" : ""}
              key={item.value}
              type="button"
              aria-pressed={category === item.value}
              onClick={() => {
                setCategory(item.value);
                setPage(1);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {visible.length ? (
          <div className="free-font-grid">
            {visible.map((font) => (
              <FontCard font={font} key={`${font.name}-${font.preview}`} />
            ))}
          </div>
        ) : (
          <div className="empty-state free-font-empty">
            <h2>No fonts found.</h2>
            <p>Try another name or category.</p>
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Font pages">
            <button
              type="button"
              onClick={() => choosePage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous font page"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            {pageWindow(currentPage, totalPages).map((value, index, values) => (
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
            ))}
            <button
              type="button"
              onClick={() => choosePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next font page"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </nav>
        )}

        <p className="free-font-source">
          Data and previews from{" "}
          <a
            href="https://github.com/jaywcjlove/free-font"
            target="_blank"
            rel="noreferrer"
          >
            jaywcjlove/free-font <ExternalLink size={12} aria-hidden="true" />
          </a>
          . Font copyrights remain with their respective authors.
        </p>
      </section>
    </main>
  );
}
