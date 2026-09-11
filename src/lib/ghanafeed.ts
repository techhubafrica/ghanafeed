/** Shared, client-safe types + helpers for the GhanaFeed newsroom feed. */

export interface Term {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
  thumb: string | null;
  imageAlt: string;
  categories: Term[];
  tags: Term[];
  readingTime: number;
  /** Only present on the single-article endpoint. */
  content?: string;
}

export interface HomeFeed {
  posts: Article[];
  categories: Term[];
  tags: Term[];
}

export interface ArchiveResult {
  term: Term | null;
  posts: Article[];
  page: number;
  totalPages: number;
  total: number;
}

export interface ArticleResult {
  article: Article | null;
  related: Article[];
}

const NAMED: Record<string, string> = {
  amp: "&",
  nbsp: " ",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  hellip: "…",
  rsquo: "\u2019",
  lsquo: "\u2018",
  ldquo: "\u201C",
  rdquo: "\u201D",
  ndash: "\u2013",
  mdash: "\u2014",
  laquo: "\u00AB",
  raquo: "\u00BB",
  deg: "\u00B0",
  eacute: "\u00E9",
  egrave: "\u00E8",
};

export function decodeEntities(input: string): string {
  if (!input) return "";
  return input
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED[name.toLowerCase()] ?? m);
}

export function stripHtml(input: string): string {
  return decodeEntities(String(input ?? "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export function truncate(input: string, max = 180): string {
  if (input.length <= max) return input;
  return input.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

/** "3 hours ago" / "12 Aug 2026" for older items. */
export function timeAgo(iso: string): string {
  const then = new Date(iso.endsWith("Z") ? iso : iso + "Z").getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function formatDate(iso: string): string {
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Deterministic accent per category slug so sections feel colour-coded. */
export function categoryAccent(slug: string): string {
  const map: Record<string, string> = {
    news: "var(--gf-red)",
    politics: "var(--gf-gold)",
    sports: "var(--gf-green)",
    "business-economy": "var(--gf-gold)",
    entertainment: "var(--gf-red)",
    editorial: "var(--gf-gold)",
    religion: "var(--gf-green)",
    education: "var(--gf-green)",
    "world-news": "var(--gf-red)",
    "arts-culture": "var(--gf-gold)",
    "campus-vibes": "var(--gf-green)",
    technology: "var(--gf-red)",
  };
  return map[slug] ?? "var(--gf-red)";
}

export const PRIMARY_NAV = [
  { label: "Home", to: "/" },
  { label: "News", slug: "news" },
  { label: "Politics", slug: "politics" },
  { label: "Sports", slug: "sports" },
  { label: "Business", slug: "business-economy" },
  { label: "Editorial", slug: "editorial" },
  { label: "Entertainment", slug: "entertainment" },
  { label: "Religion", slug: "religion" },
  { label: "World", slug: "world-news" },
  { label: "Campus Vibes", slug: "campus-vibes" },
] as const;

export const SITE_ORIGIN = "https://ghanafeed.com";

/** Links that live on ghanafeed.com — we send readers straight to the source. */
export const EXTERNAL_LINKS = {
  advertise: `${SITE_ORIGIN}/advertise`,
  about: `${SITE_ORIGIN}/about-us`,
  contact: `${SITE_ORIGIN}/contact`,
  contribute: `${SITE_ORIGIN}/join-as-contributor`,
  jobs: `${SITE_ORIGIN}/job-advertisements`,
  allArticles: `${SITE_ORIGIN}/all-articles`,
  privacy: `${SITE_ORIGIN}/privacy-policy`,
  terms: `${SITE_ORIGIN}/terms-conditions`,
  cookies: `${SITE_ORIGIN}/cookie-policy`,
  disclaimer: `${SITE_ORIGIN}/disclaimer`,
  facebook: "https://www.facebook.com/share/18Gv51oFCM/",
  youtube: "https://www.youtube.com/@GhanaFeed",
  linkedin: "https://www.linkedin.com/company/ghanafeed/",
  email: "mailto:info@ghanafeed.com",
  phone: "tel:0557024346",
  whatsapp: "https://wa.me/233557024341",
} as const;

export const FOOTER_PAGES = [
  { label: "About us", href: EXTERNAL_LINKS.about },
  { label: "Contact", href: EXTERNAL_LINKS.contact },
  { label: "Join as contributor", href: EXTERNAL_LINKS.contribute },
  { label: "Job adverts", href: EXTERNAL_LINKS.jobs },
  { label: "Privacy policy", href: "/privacy", internal: true },
  { label: "Terms & conditions", href: EXTERNAL_LINKS.terms },
  { label: "Cookie policy", href: EXTERNAL_LINKS.cookies },
  { label: "Disclaimer", href: EXTERNAL_LINKS.disclaimer },
] as const;
