import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, BellRing, Home, LayoutGrid, Search, X } from "lucide-react";
import { PRIMARY_NAV } from "@/lib/ghanafeed";
import { useBreakingAlerts } from "@/hooks/use-breaking-alerts";

/** Fixed bottom button bar for phones: Home, Sections, Search, Alerts. */
export function MobileTabBar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sheetOpen, setSheetOpen] = useState(false);
  const { enabled, permission, toggle } = useBreakingAlerts();

  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] transition-colors ${
      active ? "text-gf-red" : "text-muted-foreground"
    }`;

  return (
    <>
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-label="Sections">
          <button
            aria-label="Close sections"
            className="absolute inset-0 bg-gf-ink/60"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-xl border-t border-border bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                Sections
              </span>
              <button onClick={() => setSheetOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-px bg-border">
              {PRIMARY_NAV.map((item) =>
                "to" in item ? (
                  <Link
                    key={item.label}
                    to="/"
                    onClick={() => setSheetOpen(false)}
                    className="bg-background px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.label}
                    to="/c/$slug"
                    params={{ slug: item.slug }}
                    onClick={() => setSheetOpen(false)}
                    className="bg-background px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </div>
      )}

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <Link to="/" className={itemClass(pathname === "/")}>
          <Home className="h-5 w-5" />
          Home
        </Link>
        <button type="button" onClick={() => setSheetOpen(true)} className={itemClass(sheetOpen)}>
          <LayoutGrid className="h-5 w-5" />
          Sections
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/search", search: { q: "", page: 1 } })}
          className={itemClass(pathname === "/search")}
        >
          <Search className="h-5 w-5" />
          Search
        </button>
        {permission !== "unsupported" && (
          <button
            type="button"
            onClick={toggle}
            disabled={permission === "denied"}
            aria-pressed={enabled}
            className={itemClass(enabled)}
          >
            {enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            Alerts
          </button>
        )}
      </nav>
    </>
  );
}
