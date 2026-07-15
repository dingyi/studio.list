import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  const searchProps = homeSearch
    ? { type: "button" as const, onClick: onSearch }
    : {
        type: "button" as const,
        onClick: () => (window.location.href = "/?search=1"),
      };

  useEffect(() => {
    setReady(true);
    const showSubmitNotice = () => setSubmitOpen(true);
    window.addEventListener("studio-submit", showSubmitNotice);
    return () => window.removeEventListener("studio-submit", showSubmitNotice);
  }, []);

  return (
    <>
      <header className="site-header" data-header-ready={ready}>
        <a className="wordmark" href="/" aria-label="studio.list home">
          studio.list
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className={active === "discover" ? "is-active" : ""} href="/">
            Discover
          </a>
          <a className={active === "about" ? "is-active" : ""} href="/about/">
            About
          </a>
          <button
            className="nav-submit"
            type="button"
            onClick={() => setSubmitOpen(true)}
          >
            Submit
          </button>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Search agencies"
            {...searchProps}
          >
            <Search aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
          <button
            className="icon-button mobile-menu-button"
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
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
