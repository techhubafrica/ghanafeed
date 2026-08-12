import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { articleQuery } from "@/lib/ghanafeed.queries";
import { CategoryPill, FeatureCard, ListCard } from "@/components/site/ArticleCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { formatDate, timeAgo } from "@/lib/ghanafeed";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!data?.article) throw notFound();
    return { article: data.article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Story not found — GhanaFeed" }, { name: "robots", content: "noindex" }],
      };
    }
    const a = loaderData.article;
    const meta: Array<Record<string, string>> = [
      { title: `${a.title} — GhanaFeed` },
      { name: "description", content: a.excerpt.slice(0, 155) },
      { property: "og:type", content: "article" },
      { property: "og:title", content: a.title },
      { property: "og:description", content: a.excerpt.slice(0, 155) },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (a.image?.startsWith("https://")) {
      meta.push({ property: "og:image", content: a.image });
      meta.push({ name: "twitter:image", content: a.image });
    }
    return { meta };
  },
  notFoundComponent: ArticleMissing,
  component: ArticlePage,
});

function ArticleMissing() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-gf-red">404</span>
      <h1 className="mt-3 font-display text-3xl font-black">This story has moved on</h1>
      <p className="mt-3 text-muted-foreground">
        The article you're looking for isn't available. Head back to the front page for the latest.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-gf-red px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to GhanaFeed
      </Link>
    </div>
  );
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(slug));
  const article = data.article;
  if (!article) return <ArticleMissing />;

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    await navigator.clipboard?.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gf-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Front page
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <div className="flex flex-wrap gap-2">
            {article.categories.slice(0, 3).map((c) => (
              <CategoryPill key={c.id} slug={c.slug} name={c.name} />
            ))}
          </div>

          <h1 className="mt-4 font-display text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.9rem]">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-4 border-l-2 border-gf-gold pl-4 text-lg leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="text-foreground">GhanaFeed Newsroom</span>
            <span>{formatDate(article.date)}</span>
            <span>{timeAgo(article.date)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {article.readingTime} min read
            </span>
            <button
              onClick={share}
              className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 transition-colors hover:border-gf-gold hover:text-gf-gold"
            >
              <Share2 className="h-3 w-3" /> Share
            </button>
          </div>

          {article.image && (
            <figure className="mt-6">
              <img
                src={article.image}
                alt={article.imageAlt || article.title}
                referrerPolicy="no-referrer"
                className="w-full rounded-sm border border-border object-cover"
                loading="eager"
              />
              {article.imageAlt && (
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {article.imageAlt}
                </figcaption>
              )}
            </figure>
          )}

          {article.content && article.content.replace(/<[^>]*>/g, "").trim().length > 0 ? (
            <div
              className="article-body mt-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="article-body mt-8">
              <p>{article.excerpt}</p>
              <p>
                <a href={`https://ghanafeed.com/${article.slug}/`} target="_blank" rel="noreferrer noopener">
                  Read the full story on GhanaFeed.com
                </a>
              </p>
            </div>
          )}

          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Tags
              </span>
              {article.tags.map((t) => (
                <Link
                  key={t.id}
                  to="/t/$slug"
                  params={{ slug: t.slug }}
                  className="rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-gf-gold hover:text-foreground"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}
        </article>

        <aside className="space-y-10 lg:col-span-4">
          {data.related.length > 0 && (
            <section>
              <SectionHeading title="Related" eyebrow="More on this" />
              <div className="flex flex-col gap-4">
                {data.related.slice(0, 5).map((a) => (
                  <ListCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
          <NewsletterCard />
        </aside>
      </div>

      {data.related.length > 5 && (
        <section className="mt-14">
          <SectionHeading title="Keep Reading" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.slice(5, 8).map((a) => (
              <FeatureCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
