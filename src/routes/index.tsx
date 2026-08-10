import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { homeFeedQuery } from "@/lib/ghanafeed.queries";
import { HeroCard, FeatureCard, ListCard, TextCard } from "@/components/site/ArticleCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { PRIMARY_NAV, type Article } from "@/lib/ghanafeed";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(homeFeedQuery());
  },
  head: () => {
    const title = "GhanaFeed — Breaking Ghana News, Politics, Sports & Business";
    const description =
      "Fearless journalism from Accra. Live headlines, politics, business, sports, entertainment and world news from the GhanaFeed newsroom.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: HomePage,
});

function byCategory(posts: Article[], slug: string, limit: number) {
  return posts.filter((p) => p.categories.some((c) => c.slug === slug)).slice(0, limit);
}

function HomePage() {
  const { data } = useSuspenseQuery(homeFeedQuery());
  const posts = data.posts;

  const lead = posts[0];
  const secondary = posts.slice(1, 3);
  const strip = posts.slice(3, 7);
  const latest = posts.slice(0, 6);
  const mostRead = posts.slice(7, 12);

  const sectionSlugs = ["news", "politics", "sports", "business-economy", "entertainment"];
  const sections = sectionSlugs
    .map((slug) => ({
      slug,
      label: PRIMARY_NAV.find((n) => "slug" in n && n.slug === slug)?.label ?? slug,
      items: byCategory(posts, slug, 5),
    }))
    .filter((s) => s.items.length >= 2);

  if (!lead) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-black">The newsroom is quiet</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn't load stories right now. Please refresh in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Lead block */}
      <section aria-label="Top stories" className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HeroCard article={lead} eager />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-4">
          <div className="border-b border-border pb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-gf-gold">
              Also leading
            </span>
          </div>
          {secondary.map((a) => (
            <FeatureCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* Strip */}
      {strip.length > 0 && (
        <section className="mt-8 grid gap-5 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-4">
          {strip.map((a) => (
            <TextCard key={a.id} article={a} />
          ))}
        </section>
      )}

      {/* Main grid */}
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <section>
            <SectionHeading title="Latest Stories" eyebrow="Updated continuously" />
            <div className="grid gap-6 sm:grid-cols-2">
              {latest.map((a) => (
                <FeatureCard key={a.id} article={a} />
              ))}
            </div>
          </section>

          {sections.map((s) => (
            <section key={s.slug} className="mt-12">
              <SectionHeading title={s.label} slug={s.slug} />
              <div className="grid gap-6 md:grid-cols-2">
                <FeatureCard article={s.items[0]} />
                <div className="flex flex-col gap-4">
                  {s.items.slice(1).map((a) => (
                    <ListCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Rail */}
        <aside className="space-y-10 lg:col-span-4">
          <section>
            <SectionHeading title="Most Read" eyebrow="Trending now" />
            <div className="flex flex-col gap-4">
              {mostRead.map((a, i) => (
                <ListCard key={a.id} article={a} index={i} />
              ))}
            </div>
          </section>

          <NewsletterCard />

          {data.categories.length > 0 && (
            <section>
              <SectionHeading title="Browse Sections" />
              <div className="flex flex-wrap gap-2">
                {data.categories.slice(0, 14).map((c) => (
                  <Link
                    key={c.id}
                    to="/c/$slug"
                    params={{ slug: c.slug }}
                    className="rounded-sm border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-gf-gold hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
