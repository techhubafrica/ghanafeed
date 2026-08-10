import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { archiveQuery } from "@/lib/ghanafeed.queries";
import { FeatureCard } from "@/components/site/ArticleCard";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: String(search.q ?? ""),
    page: Number(search.page ?? 1) || 1,
  }),
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page }),
  loader: async ({ context, deps }) => {
    if (!deps.q) return;
    await context.queryClient.ensureQueryData(archiveQuery("search", deps.q, deps.page));
  },
  head: ({ match }) => {
    const q = match.search?.q;
    const title = q ? `Search: ${q} — GhanaFeed` : "Search GhanaFeed";
    const description = q
      ? `Ghanaian news stories matching “${q}” from the GhanaFeed newsroom.`
      : "Search breaking news, politics, sports and business coverage from GhanaFeed.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const { q, page } = Route.useSearch();
  const navigate = useNavigate();
  const [value, setValue] = useState(q);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-black sm:text-4xl">Search GhanaFeed</h1>
      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/search", search: { q: value.trim(), page: 1 } });
        }}
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search stories, people, places…"
            className="h-12 w-full rounded-sm border border-border bg-surface pl-10 pr-4 text-sm outline-none transition-colors focus:border-gf-gold"
          />
        </div>
        <button
          type="submit"
          className="h-12 rounded-sm bg-gf-red px-6 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      {q ? <Results q={q} page={page} /> : (
        <p className="mt-10 text-sm text-muted-foreground">
          Type a keyword above to search the full GhanaFeed archive.
        </p>
      )}
    </div>
  );
}

function Results({ q, page }: { q: string; page: number }) {
  const { data } = useSuspenseQuery(archiveQuery("search", q, page));

  if (!data.posts.length) {
    return (
      <div className="mt-12 rounded-md border border-border bg-surface p-10 text-center">
        <p className="font-display text-xl font-bold">No stories found for “{q}”</p>
        <p className="mt-2 text-sm text-muted-foreground">Try a shorter keyword or a different spelling.</p>
      </div>
    );
  }

  return (
    <>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {data.total} result{data.total === 1 ? "" : "s"} for “{q}”
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((a) => (
          <FeatureCard key={a.id} article={a} />
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        {page > 1 ? (
          <Link
            to="/search"
            search={{ q, page: page - 1 }}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-gf-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </Link>
        ) : <span />}
        {page < data.totalPages ? (
          <Link
            to="/search"
            search={{ q, page: page + 1 }}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-gf-gold"
          >
            Next <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : <span />}
      </div>
    </>
  );
}
