import { queryOptions } from "@tanstack/react-query";
import { getArchiveFeed, getArticleBySlug, getHomeFeed } from "./ghanafeed.functions";

export const homeFeedQuery = () =>
  queryOptions({
    queryKey: ["gf", "home"],
    queryFn: () => getHomeFeed(),
    staleTime: 1000 * 60 * 2,
  });

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["gf", "article", slug],
    queryFn: () => getArticleBySlug({ data: { slug } }),
    staleTime: 1000 * 60 * 5,
  });

export const archiveQuery = (kind: "category" | "tag" | "search", value: string, page = 1) =>
  queryOptions({
    queryKey: ["gf", "archive", kind, value, page],
    queryFn: () => getArchiveFeed({ data: { kind, value, page } }),
    staleTime: 1000 * 60 * 2,
  });
