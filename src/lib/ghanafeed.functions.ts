import { createServerFn } from "@tanstack/react-start";
import { fetchArchive, fetchArticle, fetchHome } from "./ghanafeed.server";

export const getHomeFeed = createServerFn({ method: "GET" }).handler(async () => fetchHome());

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ({ slug: String((data as { slug?: string })?.slug ?? "") }))
  .handler(async ({ data }) => fetchArticle(data.slug));

export const getArchiveFeed = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    const kind = String(raw.kind ?? "category");
    return {
      kind: (kind === "tag" || kind === "search" ? kind : "category") as "category" | "tag" | "search",
      value: String(raw.value ?? ""),
      page: Number(raw.page ?? 1) || 1,
    };
  })
  .handler(async ({ data }) => fetchArchive(data));
