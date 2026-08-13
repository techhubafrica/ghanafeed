import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Linkedin, Mail, Menu, Phone, Search, X, Youtube } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { NewsTicker } from "./NewsTicker";
import { homeFeedQuery } from "@/lib/ghanafeed.queries";
import { PRIMARY_NAV } from "@/lib/ghanafeed";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inputRef = useRef<HTMLInputElement>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data } = useQuery(homeFeedQuery());
  const breaking = mounted ? (data?.posts ?? []).slice(0, 8) : [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate({ to: "/search", search: { q: query.trim(), page: 1 } });
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="h-1 w-full flag-bar" />

      {/* Utility strip */}
      <div className="hidden border-b border-border bg-surface lg:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span suppressHydrationWarning>{today} · Accra, Ghana</span>
          <div className="flex items-center gap-5">
            <a href="tel:0557024346" className="inline-flex items-center gap-1.5 transition-colors hover:text-gf-gold">
              <Phone className="h-3 w-3" /> 055 702 4346
            </a>
            <a href="mailto:info@ghanafeed.com" className="inline-flex items-center gap-1.5 transition-colors hover:text-gf-gold">
              <Mail className="h-3 w-3" /> info@ghanafeed.com
            </a>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer noopener" aria-label="GhanaFeed on Facebook" className="transition-colors hover:text-gf-gold">
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer noopener" aria-label="GhanaFeed on YouTube" className="transition-colors hover:text-gf-gold">
                <Youtube className="h-3.5 w-3.5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer noopener" aria-label="GhanaFeed on LinkedIn" className="transition-colors hover:text-gf-gold">
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div
        className={cn(
          "border-b border-border bg-background/92 backdrop-blur-xl transition-all",
          scrolled ? "py-1.5" : "py-3",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-gf-gold hover:text-foreground lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Wordmark compact={scrolled} />

          <nav className="ml-6 hidden flex-1 items-center gap-5 xl:flex">
            {PRIMARY_NAV.slice(0, 7).map((item) =>
              "to" in item ? (
                <Link
                  key={item.label}
                  to="/"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "!text-gf-gold" }}
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.label}
                  to="/c/$slug"
                  params={{ slug: item.slug }}
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "!text-gf-gold" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-gf-gold hover:text-foreground"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
            <Link
              to="/advertise"
              className="hidden rounded-sm bg-gf-red px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90 sm:inline-block"
            >
              Advertise
            </Link>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={submitSearch} className="mx-auto mt-3 max-w-7xl px-4 sm:px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search GhanaFeed…"
                className="h-11 w-full rounded-sm border border-border bg-surface pl-10 pr-4 text-sm outline-none transition-colors focus:border-gf-gold"
              />
            </div>
          </form>
        )}
      </div>

      {/* Section nav */}
      <div className="hidden border-b border-border bg-surface lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 no-scrollbar">
          {PRIMARY_NAV.map((item) =>
            "to" in item ? (
              <Link
                key={item.label}
                to="/"
                activeOptions={{ exact: true }}
                className="whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "!border-gf-red !text-foreground" }}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                to="/c/$slug"
                params={{ slug: item.slug }}
                className="whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "!border-gf-red !text-foreground" }}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-b border-border bg-surface lg:hidden">
          <nav className="grid grid-cols-2 gap-px bg-border">
            {PRIMARY_NAV.map((item) =>
              "to" in item ? (
                <Link key={item.label} to="/" className="bg-surface px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.label}
                  to="/c/$slug"
                  params={{ slug: item.slug }}
                  className="bg-surface px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link to="/advertise" className="col-span-2 bg-gf-red px-4 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
              Advertise with us
            </Link>
          </nav>
        </div>
      )}

      <NewsTicker items={breaking} />
    </header>
  );
}
