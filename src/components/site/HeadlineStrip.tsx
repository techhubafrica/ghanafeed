import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/ghanafeed";
import { cn } from "@/lib/utils";

/**
 * Numbered, headline-only band — the quick "top of the section" scan
 * readers get on classic Ghanaian news portals.
 */
export function HeadlineStrip({
  label,
  articles,
  accent = "var(--gf-red)",
  className,
}: {
  label: string;
  articles: Article[];
  accent?: string;
  className?: string;
}) {
  if (articles.length === 0) return null;
  return (
    <section
      aria-label={label}
      className={cn("overflow-hidden rounded-md border border-border bg-surface", className)}
    >
      <div
        className="px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]"
        style={{ backgroundColor: accent, color: "var(--gf-ink)" }}
      >
        {label}
      </div>
      <ol className="divide-y divide-border">
        {articles.map((a, i) => (
          <li key={a.id} className="flex gap-3 px-3.5 py-2.5">
            <span className="mt-0.5 font-mono text-[11px] font-bold text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              to="/article/$slug"
              params={{ slug: a.slug }}
              className="headline-link line-clamp-2 font-display text-[0.9rem] font-semibold leading-snug"
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
