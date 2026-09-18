import { useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PRIMARY_NAV } from "@/lib/ghanafeed";

/**
 * Swipeable section tabs shown under the masthead on phones/tablets.
 * Keeps the active tab scrolled into view as the reader swipes between sections.
 */
export function MobileSectionTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>("[data-active='true']");
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="border-b border-border bg-surface lg:hidden">
      <div ref={scrollerRef} className="flex items-center gap-1 overflow-x-auto px-3 no-scrollbar">
        {PRIMARY_NAV.map((item) => {
          const isActive = "to" in item ? pathname === "/" : pathname === `/c/${item.slug}`;
          const className =
            "whitespace-nowrap border-b-2 px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors " +
            (isActive
              ? "border-gf-red text-foreground"
              : "border-transparent text-muted-foreground");

          return "to" in item ? (
            <Link key={item.label} to="/" data-active={isActive} className={className}>
              {item.label}
            </Link>
          ) : (
            <Link
              key={item.label}
              to="/c/$slug"
              params={{ slug: item.slug }}
              data-active={isActive}
              className={className}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
