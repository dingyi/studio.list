import { Menu, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  active?: "discover" | "about";
  homeSearch?: boolean;
  onSearch?: () => void;
}

export default function PageHeader({
  active,
  homeSearch = false,
  onSearch,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const openSearch = useCallback(() => {
    if (homeSearch) onSearch?.();
    else window.location.href = "/?search=1";
  }, [homeSearch, onSearch]);

  useEffect(() => {
    setReady(true);
    const showSubmitNotice = () => setSubmitOpen(true);
    const openSearchShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k")
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.matches("input, textarea, select") ||
        target?.isContentEditable
      )
        return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("studio-submit", showSubmitNotice);
    window.addEventListener("keydown", openSearchShortcut);
    return () => {
      window.removeEventListener("studio-submit", showSubmitNotice);
      window.removeEventListener("keydown", openSearchShortcut);
    };
  }, [openSearch]);

  return (
    <>
      <header className="site-header" data-header-ready={ready}>
        <nav className="site-nav" aria-label="Primary navigation">
          <div className="nav-left">
            <a className="wordmark" href="/" aria-label="studio.list home">
              studio.list
            </a>
            <div className="desktop-nav">
              <a
                className={active === "discover" ? "is-active" : ""}
                href="/"
              >
                Discover
              </a>
              <a
                className={active === "about" ? "is-active" : ""}
                href="/about/"
              >
                About
              </a>
            </div>
          </div>
          <button
            className="header-search"
            type="button"
            aria-label="Search agencies"
            onClick={openSearch}
          >
            <Search aria-hidden="true" size={15} strokeWidth={1.8} />
            <span>Search agencies</span>
            <kbd aria-hidden="true">
              <span>⌘</span>K
            </kbd>
          </button>
          <div className="nav-right">
            <button
              className="nav-submit"
              type="button"
              onClick={() => setSubmitOpen(true)}
            >
              Submit
            </button>
            <button
              className="mobile-menu-button"
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
          {mobileOpen && (
            <nav className="mobile-nav" aria-label="Mobile navigation">
              <a href="/">Discover</a>
              <a href="/about/">About</a>
              <button type="button" onClick={() => setSubmitOpen(true)}>
                Submit
              </button>
            </nav>
          )}
        </nav>
      </header>
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="notice-dialog">
          <DialogHeader>
            <DialogTitle>Submissions are opening soon.</DialogTitle>
            <DialogDescription>
              We are preparing a careful review process for independent design
              agencies. Check back soon.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
