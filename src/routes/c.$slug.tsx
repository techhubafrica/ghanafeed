import { createFileRoute } from "@tanstack/react-router";
import { archiveQuery } from "@/lib/ghanafeed.queries";
import { ArchiveView } from "@/components/site/ArchiveView";

export const Route = createFileRoute("/c/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page ?? 1) || 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ context, params, deps }) => {
    const data = await context.queryClient.ensureQueryData(
      archiveQuery("category", params.slug, deps.page),
    );
    return { name: data.term?.name ?? params.slug };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? params.slug;
    const title = `${name} News — GhanaFeed`;
    const description = `The latest ${name} stories, analysis and updates from the GhanaFeed newsroom in Accra.`;
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
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { page } = Route.useSearch();
  return <ArchiveView kind="category" value={slug} page={page} eyebrow="Section" />;
}
