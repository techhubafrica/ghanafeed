import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/ghanafeed";
import { categoryAccent, timeAgo } from "@/lib/ghanafeed";
import { cn } from "@/lib/utils";

export function CategoryPill({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  return (
    <Link
      to="/c/$slug"
      params={{ slug }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-px",
        className,
      )}
      style={{ backgroundColor: categoryAccent(slug), color: slug === "politics" || slug === "editorial" || slug === "business-economy" || slug === "arts-culture" ? "var(--gf-ink)" : undefined }}
    >
      {name}
    </Link>
  );
}

function Meta({ article, className }: { article: Article; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground", className)}>
      <span>{timeAgo(article.date)}</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {article.readingTime} min
      </span>
    </div>
  );
}

function Cover({
  article,
  className,
  sizes,
  eager,
}: {
  article: Article;
  className?: string;
  sizes?: string;
  eager?: boolean;
}) {
  if (!article.image) {
    return (
      <div className={cn("flex items-center justify-center bg-surface-2", className)}>
        <span className="font-display text-2xl font-black tracking-tight text-muted-foreground/40">
          GhanaFeed
        </span>
      </div>
    );
  }
  return (
    <img
      src={article.image}
      alt={article.imageAlt}
      sizes={sizes}
      referrerPolicy="no-referrer"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]", className)}
    />
  );
}

interface CardProps {
  article: Article;
  className?: string;
  eager?: boolean;
}

/** Full-bleed lead story. */
export function HeroCard({ article, className, eager }: CardProps) {
  const cat = article.categories[0];
  return (
    <article className={cn("group relative isolate overflow-hidden rounded-md border border-border bg-surface", className)}>
      <Link to="/article/$slug" params={{ slug: article.slug }} className="absolute inset-0 z-20">
        <span className="sr-only">{article.title}</span>
      </Link>
      <div className="absolute inset-0">
        <Cover article={article} eager={eager} sizes="(max-width: 1024px) 100vw, 60vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-gf-ink via-gf-ink/70 to-transparent" />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-5 pt-40 sm:p-8 sm:pt-56">
        {cat && <div className="relative z-30 w-fit"><CategoryPill slug={cat.slug} name={cat.name} /></div>}
        <h2 className="font-display text-2xl font-black leading-[1.08] text-foreground sm:text-4xl">
          {article.title}
        </h2>
        <p className="hidden max-w-2xl text-sm leading-relaxed text-muted-foreground sm:line-clamp-2">
          {article.excerpt}
        </p>
        <Meta article={article} />
      </div>
    </article>
  );
}

/** Image-on-top card used in grids. */
export function FeatureCard({ article, className, eager }: CardProps) {
  const cat = article.categories[0];
  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-md border border-border bg-surface", className)}>
      <Link to="/article/$slug" params={{ slug: article.slug }} className="relative block aspect-[16/10] overflow-hidden">
        <Cover article={article} eager={eager} sizes="(max-width: 768px) 100vw, 33vw" />
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {cat && <CategoryPill slug={cat.slug} name={cat.name} className="w-fit" />}
        <h3 className="font-display text-lg font-bold leading-snug">
          <Link to="/article/$slug" params={{ slug: article.slug }} className="headline-link">
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <Meta article={article} className="mt-auto pt-2" />
      </div>
    </article>
  );
}

/** Compact horizontal row: thumb + headline. */
export function ListCard({
  article,
  index,
  className,
}: CardProps & { index?: number }) {
  return (
    <article className={cn("group flex gap-3.5 border-b border-border/70 pb-4 last:border-0 last:pb-0", className)}>
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm sm:h-[4.5rem] sm:w-28"
      >
        <Cover article={article} sizes="120px" />
        {typeof index === "number" && (
          <span className="absolute bottom-0 left-0 bg-gf-red px-1.5 font-mono text-[11px] font-bold text-primary-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h4 className="font-display text-[0.95rem] font-semibold leading-snug">
          <Link to="/article/$slug" params={{ slug: article.slug }} className="headline-link line-clamp-3">
            {article.title}
          </Link>
        </h4>
        <Meta article={article} />
      </div>
    </article>
  );
}

/** Text-only entry for dense rails. */
export function TextCard({ article, className }: CardProps) {
  const cat = article.categories[0];
  return (
    <article className={cn("group border-l-2 border-border pl-3.5 transition-colors hover:border-gf-gold", className)}>
      {cat && (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: categoryAccent(cat.slug) }}>
          {cat.name}
        </span>
      )}
      <h4 className="mt-1 font-display text-[0.95rem] font-semibold leading-snug">
        <Link to="/article/$slug" params={{ slug: article.slug }} className="headline-link line-clamp-3">
          {article.title}
        </Link>
      </h4>
      <Meta article={article} className="mt-1.5" />
    </article>
  );
}
