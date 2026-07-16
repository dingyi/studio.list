import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

export interface AgencySearchItem {
  name: string;
  slug: string;
  meta: string;
  searchText: string;
}

interface Props {
  items: AgencySearchItem[];
  value: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function AgencySearch({
  items,
  value,
  onValueChange,
  onClose,
  loading = false,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const query = value.trim().toLocaleLowerCase();
  const results = useMemo(
    () =>
      query
        ? items
            .filter((item) => item.searchText.includes(query))
            .slice(0, 12)
        : [],
    [items, query],
  );

  useEffect(() => setActiveIndex(0), [query]);

  function chooseResult(index: number) {
    const result = results[index];
    if (result) window.location.href = `/agencies/${result.slug}/`;
  }

  return (
    <div
      className="agency-search"
      onKeyDown={(event) => {
        const fromInput = (event.target as HTMLElement).matches("input");
        if (event.key === "ArrowDown" && results.length && fromInput) {
          event.preventDefault();
          setActiveIndex((index) => (index + 1) % results.length);
        } else if (event.key === "ArrowUp" && results.length && fromInput) {
          event.preventDefault();
          setActiveIndex(
            (index) => (index - 1 + results.length) % results.length,
          );
        } else if (event.key === "Enter" && results.length && fromInput) {
          event.preventDefault();
          chooseResult(activeIndex);
        } else if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="search-dialog__input-row">
        <Search aria-hidden="true" size={17} strokeWidth={1.8} />
        <Input
          autoFocus
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Search agencies"
          aria-label="Search agencies"
          aria-controls={query ? "agency-search-results" : undefined}
        />
        {value ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => onValueChange("")}
            aria-label="Clear search"
          >
            Clear
          </button>
        ) : (
          <button
            type="button"
            className="search-escape"
            onClick={onClose}
            aria-label="Close search"
          >
            Esc
          </button>
        )}
      </div>

      {query && (
        <div
          className="search-results"
          id="agency-search-results"
          aria-label="Agency search results"
        >
          {loading ? (
            <p className="search-results__status">Searching…</p>
          ) : results.length ? (
            results.map((result, index) => (
              <a
                className={`search-result${index === activeIndex ? " is-active" : ""}`}
                href={`/agencies/${result.slug}/`}
                onMouseEnter={() => setActiveIndex(index)}
                key={result.slug}
              >
                <strong>{result.name}</strong>
                <small>/agencies/{result.slug}</small>
              </a>
            ))
          ) : (
            <p className="search-results__status">No agencies found.</p>
          )}
        </div>
      )}
    </div>
  );
}
