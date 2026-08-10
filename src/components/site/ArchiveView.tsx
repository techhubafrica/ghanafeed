import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { archiveQuery } from "@/lib/ghanafeed.queries";
import { HeroCard, FeatureCard, ListCard } from "@/components/site/ArticleCard";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { categoryAccent } from "@/lib/ghanafeed";

interface Props {
  kind: "category" | "tag";
  value: string;
  page: number;
  eyebrow: string;
}

export function ArchiveView({ kind, value, page, eyebrow }: Props) {
  const { data } = useSuspenseQuery(archiveQuery(kind, value, page));
  const name = data.term?.name ?? value;
  const accent = kind === "category" ? categoryAccent(value) : "var(--gf-gold)";

  const [lead, ...rest] = data.posts;
  const to = kind === "category" ? "/c/$slug" : "/t/$slug";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="border-b border-border pb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </span>
        <h1 className="mt-1 flex items-center gap-3 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
          <span className="h-9 w-2" style={{ backgroundColor: accent }} />
          {kind === "tag" ? `#${name}` : name}
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {data.total} {data.total === 1 ? "story" : "stories"} · page {data.page} of{" "}
          {Math.max(data.totalPages, 1)}
        </p>
      </header>

      {data.posts.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          No stories here yet. Check back soon.
        </p>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {page === 1 && lead && <HeroCard article={lead} eager />}
            <div className={`grid gap-6 sm:grid-cols-2 ${page === 1 && lead ? "mt-8" : ""}`}>
              {(page === 1 ? rest : data.posts).map((a) => (
                <FeatureCard key={a.id} article={a} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-between border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.14em]">
                {page > 1 ? (
                  <Link
                    to={to}
                    params={{ slug: value }}
                    search={{ page: page - 1 }}
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-gf-gold"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Newer
                  </Link>
                ) : (
                  <span />
                )}
                {page < data.totalPages ? (
                  <Link
                    to={to}
                    params={{ slug: value }}
                    search={{ page: page + 1 }}
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-gf-gold"
                  >
                    Older <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>

          <aside className="space-y-10 lg:col-span-4">
            <NewsletterCard />
            {data.posts.length > 4 && (
              <section>
                <h2 className="mb-4 border-b border-border pb-2 font-display text-lg font-black uppercase tracking-tight">
                  In this section
                </h2>
                <div className="flex flex-col gap-4">
                  {data.posts.slice(0, 5).map((a, i) => (
                    <ListCard key={a.id} article={a} index={i} />
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
