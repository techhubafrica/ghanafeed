import { createFileRoute } from "@tanstack/react-router";
import { archiveQuery } from "@/lib/ghanafeed.queries";
import { ArchiveView } from "@/components/site/ArchiveView";

export const Route = createFileRoute("/t/$slug")({
  validateSearch: (search: Record<string, unknown>): { page?: number } =>
    search.page ? { page: Number(search.page) || 1 } : {},
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, params, deps }) => {
    const data = await context.queryClient.ensureQueryData(
      archiveQuery("tag", params.slug, deps.page),
    );
    return { name: data.term?.name ?? params.slug };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? params.slug;
    const title = `#${name} — GhanaFeed`;
    const description = `Every GhanaFeed story tagged ${name}, updated as the news breaks.`;
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
  component: TagPage,
});

function TagPage() {
  const { slug } = Route.useParams();
  const page = Route.useSearch().page ?? 1;
  return <ArchiveView kind="tag" value={slug} page={page} eyebrow="Topic" />;
}
