import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Wordmark } from "./Wordmark";
import { NewsletterCard } from "./NewsletterCard";
import { homeFeedQuery } from "@/lib/ghanafeed.queries";
import { EXTERNAL_LINKS, FOOTER_PAGES, PRIMARY_NAV } from "@/lib/ghanafeed";

export function SiteFooter() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const { data } = useQuery(homeFeedQuery());
  const tags = hydrated ? (data?.tags ?? []) : [];


  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="h-1 w-full flag-bar" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Fearless journalism from Accra — reporting Ghana's politics, business, sport and
            culture without fear or favour.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { Icon: Facebook, href: EXTERNAL_LINKS.facebook, label: "Facebook" },
              { Icon: Youtube, href: EXTERNAL_LINKS.youtube, label: "YouTube" },
              { Icon: Linkedin, href: EXTERNAL_LINKS.linkedin, label: "LinkedIn" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`GhanaFeed on ${label}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-gf-gold hover:text-gf-gold"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gf-gold">
            Sections
          </h4>
          <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-muted-foreground lg:grid-cols-1">
            {PRIMARY_NAV.filter((i) => !("to" in i)).map((item) => (
              <li key={item.label}>
                <Link
                  to="/c/$slug"
                  params={{ slug: (item as { slug: string }).slug }}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gf-gold">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gf-red" />
              St. 4352, Greater Accra, Ghana
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gf-red" />
              <span>
                <a href={EXTERNAL_LINKS.phone} className="hover:text-foreground">055 702 4346</a>
                <a
                  href={EXTERNAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block text-xs hover:text-foreground"
                >
                  WhatsApp: 055 702 4341
                </a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gf-red" />
              <a href={EXTERNAL_LINKS.email} className="hover:text-foreground">
                info@ghanafeed.com
              </a>
            </li>
          </ul>
          {tags.length > 0 && (
            <div className="mt-6">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gf-gold">
                Popular tags
              </h4>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.slice(0, 8).map((t) => (
                  <Link
                    key={t.id}
                    to="/t/$slug"
                    params={{ slug: t.slug }}
                    className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-gf-gold hover:text-foreground"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <NewsletterCard compact />
          <a
            href={EXTERNAL_LINKS.advertise}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-block rounded-sm bg-gf-red px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Advertise with us
          </a>
          <div className="mt-8">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gf-gold">
              More from GhanaFeed
            </h4>
            <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              {FOOTER_PAGES.map((page) => (
                <li key={page.label}>
                  <a
                    href={page.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-foreground"
                  >
                    {page.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} GhanaFeed · Fearless Journalism</span>
          <span>Made in Accra 🇬🇭</span>
        </div>
      </div>
    </footer>
  );
}
