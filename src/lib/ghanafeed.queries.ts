import { queryOptions } from "@tanstack/react-query";
import { getArchiveFeed, getArticleBySlug, getHomeFeed } from "./ghanafeed.functions";

/** Keep the app in lockstep with ghanafeed.com: poll frequently and on focus/reconnect. */
const LIVE = {
  staleTime: 0,
  gcTime: 1000 * 60 * 10,
  refetchInterval: 1000 * 60,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchOnMount: true,
} as const;

export const homeFeedQuery = () =>
  queryOptions({
    queryKey: ["gf", "home"],
    queryFn: () => getHomeFeed(),
    ...LIVE,
  });

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["gf", "article", slug],
    queryFn: () => getArticleBySlug({ data: { slug } }),
    ...LIVE,
    refetchInterval: 1000 * 60 * 5,
  });

export const archiveQuery = (kind: "category" | "tag" | "search", value: string, page = 1) =>
  queryOptions({
    queryKey: ["gf", "archive", kind, value, page],
    queryFn: () => getArchiveFeed({ data: { kind, value, page } }),
    ...LIVE,
  });
