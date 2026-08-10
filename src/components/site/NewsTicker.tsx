import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/ghanafeed";

export function NewsTicker({ items }: { items: Article[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="flex items-stretch border-b border-border bg-background">
      <div className="flex shrink-0 items-center gap-2 bg-gf-red px-3 sm:px-4">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground live-dot" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground sm:text-[11px]">
          News Flash
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee-track py-2">
          {loop.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              to="/article/$slug"
              params={{ slug: item.slug }}
              className="mx-5 inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] text-muted-foreground transition-colors hover:text-gf-gold"
            >
              <span className="text-gf-gold">◆</span>
              {item.title}
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
