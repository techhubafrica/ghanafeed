/** Server-only fetch layer for the GhanaFeed WordPress REST API. */
import type {
  Article,
  ArchiveResult,
  ArticleResult,
  HomeFeed,
  Term,
} from "./ghanafeed";
import { stripHtml, truncate } from "./ghanafeed";

const API = "https://ghanafeed.com/wp-json/wp/v2";

const LIST_FIELDS =
  "id,slug,title,excerpt,date,_links,_embedded";

async function api<T>(path: string): Promise<{ data: T; headers: Headers }> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${API}/${path}${sep}_ts=${Date.now()}`, {
    headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GhanaFeed API ${res.status} for ${path}`);
  return { data: (await res.json()) as T, headers: res.headers };
}

function pickImage(media: any): { image: string | null; thumb: string | null; alt: string } {
  if (!media || media.code) return { image: null, thumb: null, alt: "" };
  const sizes = media.media_details?.sizes ?? {};
  const image =
    sizes.large?.source_url ??
    sizes.medium_large?.source_url ??
    media.source_url ??
    null;
  const thumb =
    sizes.medium?.source_url ?? sizes.thumbnail?.source_url ?? image ?? null;
  return { image, thumb, alt: media.alt_text || "" };
}

function readingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function normalize(raw: any, withContent = false): Article {
  const embedded = raw?._embedded ?? {};
  const media = Array.isArray(embedded["wp:featuredmedia"]) ? embedded["wp:featuredmedia"][0] : null;
  const { image, thumb, alt } = pickImage(media);
  const termGroups: any[][] = Array.isArray(embedded["wp:term"]) ? embedded["wp:term"] : [];
  const flat = termGroups.flat().filter(Boolean);
  const toTerm = (t: any): Term => ({ id: t.id, name: stripHtml(t.name), slug: t.slug });

  const excerptSource = raw?.excerpt?.rendered ?? raw?.content?.rendered ?? "";

  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw?.title?.rendered ?? ""),
    excerpt: truncate(stripHtml(excerptSource), 200),
    date: raw.date,
    image,
    thumb,
    imageAlt: alt || stripHtml(raw?.title?.rendered ?? ""),
    categories: flat.filter((t) => t.taxonomy === "category").map(toTerm),
    tags: flat.filter((t) => t.taxonomy === "post_tag").map(toTerm),
    readingTime: readingTime(raw?.content?.rendered ?? excerptSource),
    ...(withContent ? { content: sanitize(raw?.content?.rendered ?? "") } : {}),
  };
}

/** Light scrub: drop scripts/styles and WP boilerplate wrappers. */
function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "")
    .replace(/<div class="(?:sharedaddy|jp-relatedposts)[\s\S]*?<\/div>/gi, "");
}

export async function fetchHome(): Promise<HomeFeed> {
  const [posts, categories, tags] = await Promise.all([
    api<any[]>(`posts?per_page=100&_embed=1&_fields=${LIST_FIELDS}`),
    api<any[]>(`categories?per_page=40&orderby=count&order=desc&_fields=id,name,slug,count`),
    api<any[]>(`tags?per_page=14&orderby=count&order=desc&_fields=id,name,slug,count`),
  ]);

  return {
    posts: posts.data.map((p) => normalize(p)),
    categories: categories.data
      .filter((c: any) => c.count > 0 && c.slug !== "uncategorized")
      .map((c: any) => ({ id: c.id, name: stripHtml(c.name), slug: c.slug })),
    tags: tags.data
      .filter((t: any) => t.count > 0)
      .map((t: any) => ({ id: t.id, name: stripHtml(t.name), slug: t.slug })),
  };
}

export async function fetchArticle(slug: string): Promise<ArticleResult> {
  if (!slug) return { article: null, related: [] };
  const { data } = await api<any[]>(`posts?slug=${encodeURIComponent(slug)}&_embed=1`);
  const raw = data[0];
  if (!raw) return { article: null, related: [] };
  const article = normalize(raw, true);

  const catId = article.categories[0]?.id;
  let related: Article[] = [];
  if (catId) {
    try {
      const rel = await api<any[]>(
        `posts?categories=${catId}&exclude=${article.id}&per_page=4&_embed=1&_fields=${LIST_FIELDS}`,
      );
      related = rel.data.map((p) => normalize(p));
    } catch {
      related = [];
    }
  }
  return { article, related };
}

async function findTerm(taxonomy: "categories" | "tags", slug: string): Promise<Term | null> {
  const { data } = await api<any[]>(
    `${taxonomy}?slug=${encodeURIComponent(slug)}&_fields=id,name,slug`,
  );
  const t = data[0];
  return t ? { id: t.id, name: stripHtml(t.name), slug: t.slug } : null;
}

export async function fetchArchive(input: {
  kind: "category" | "tag" | "search";
  value: string;
  page: number;
}): Promise<ArchiveResult> {
  const page = Math.max(1, input.page || 1);
  const empty: ArchiveResult = { term: null, posts: [], page, totalPages: 0, total: 0 };
  if (!input.value) return empty;

  let query = "";
  let term: Term | null = null;

  if (input.kind === "search") {
    query = `search=${encodeURIComponent(input.value)}`;
    term = { id: 0, name: input.value, slug: input.value };
  } else {
    term = await findTerm(input.kind === "category" ? "categories" : "tags", input.value);
    if (!term) return empty;
    query = input.kind === "category" ? `categories=${term.id}` : `tags=${term.id}`;
  }

  const { data, headers } = await api<any[]>(
    `posts?${query}&page=${page}&per_page=12&_embed=1&_fields=${LIST_FIELDS}`,
  );

  return {
    term,
    posts: data.map((p) => normalize(p)),
    page,
    totalPages: Number(headers.get("x-wp-totalpages") ?? 1),
    total: Number(headers.get("x-wp-total") ?? data.length),
  };
}
