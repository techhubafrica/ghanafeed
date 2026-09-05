import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { archiveQuery, homeFeedQuery } from "@/lib/ghanafeed.queries";
import { HeroCard, FeatureCard, ListCard, MosaicCard } from "@/components/site/ArticleCard";
import { HeadlineStrip } from "@/components/site/HeadlineStrip";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { categoryAccent, PRIMARY_NAV } from "@/lib/ghanafeed";

interface Props {
  kind: "category" | "tag";
  value: string;
  page: number;
  eyebrow: string;
}

export function ArchiveView({ kind, value, page, eyebrow }: Props) {
  const { data } = useSuspenseQuery(archiveQuery(kind, value, page));
  const home = useSuspenseQuery(homeFeedQuery());
  const name = data.term?.name ?? value;
  const accent = kind === "category" ? categoryAccent(value) : "var(--gf-gold)";

  const [lead, ...rest] = data.posts;
  const to = kind === "category" ? "/c/$slug" : "/t/$slug";

  // Reference-style layout: lead + secondary pair, then a photo mosaic, then the rest.
  const secondary = rest.slice(0, 2);
  const mosaic = rest.slice(2, 6);
  const remainder = rest.slice(6);
  const gridItems = page === 1 ? remainder : data.posts;

  type NavSection = Extract<(typeof PRIMARY_NAV)[number], { slug: string }>;
  const siblings = PRIMARY_NAV.filter(
    (n): n is NavSection => "slug" in n && n.slug !== value,
  ).slice(0, 8);


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
        <>
          {page === 1 && data.posts.length > 2 && (
            <HeadlineStrip
              label={`Top in ${name}`}
              accent={accent}
              articles={data.posts.slice(0, 5)}
              className="mt-6"
            />
          )}

          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {page === 1 && lead && (
                <>
                  <HeroCard article={lead} eager />
                  {secondary.length > 0 && (
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      {secondary.map((a) => (
                        <FeatureCard key={a.id} article={a} />
                      ))}
                    </div>
                  )}
                  {mosaic.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {mosaic.map((a) => (
                        <MosaicCard key={a.id} article={a} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {gridItems.length > 0 && (
                <div className="mt-8 border-t border-border pt-6">
                  <h2 className="mb-5 font-display text-lg font-black uppercase tracking-tight">
                    More in {kind === "tag" ? `#${name}` : name}
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {gridItems.map((a) => (
                      <FeatureCard key={a.id} article={a} />
                    ))}
                  </div>
                </div>
              )}

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
              <section>
                <h2 className="mb-4 border-b border-border pb-2 font-display text-lg font-black uppercase tracking-tight">
                  Trending across GhanaFeed
                </h2>
                <div className="flex flex-col gap-4">
                  {home.data.posts.slice(0, 5).map((a, i) => (
                    <ListCard key={a.id} article={a} index={i} />
                  ))}
                </div>
              </section>

              <NewsletterCard />

              {siblings.length > 0 && (
                <section>
                  <h2 className="mb-4 border-b border-border pb-2 font-display text-lg font-black uppercase tracking-tight">
                    Other sections
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {siblings.map((n) => (
                      <Link
                        key={n.slug}
                        to="/c/$slug"
                        params={{ slug: n.slug }}
                        className="rounded-sm border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-gf-gold hover:text-foreground"
                      >
                        {n.label}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
