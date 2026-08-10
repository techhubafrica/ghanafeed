import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { categoryAccent } from "@/lib/ghanafeed";

export function SectionHeading({
  title,
  slug,
  eyebrow,
}: {
  title: string;
  slug?: string;
  eyebrow?: string;
}) {
  const accent = slug ? categoryAccent(slug) : "var(--gf-red)";
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
      <div>
        {eyebrow && (
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h2 className="relative flex items-center gap-2.5 font-display text-xl font-black uppercase tracking-tight sm:text-2xl">
          <span className="h-5 w-1.5" style={{ backgroundColor: accent }} />
          {title}
        </h2>
      </div>
      {slug && (
        <Link
          to="/c/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gf-gold"
        >
          View more <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
