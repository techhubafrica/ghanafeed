import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Target, Users, Zap } from "lucide-react";
import { NewsletterCard } from "@/components/site/NewsletterCard";

export const Route = createFileRoute("/advertise")({
  head: () => {
    const title = "Advertise on GhanaFeed — Reach Ghana's News Audience";
    const description =
      "Put your brand in front of engaged Ghanaian readers. Display, sponsored content and newsletter placements with the GhanaFeed newsroom in Accra.";
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
  component: AdvertisePage,
});

const FORMATS = [
  {
    Icon: Zap,
    title: "Leaderboard & In-Feed Display",
    body: "High-visibility placements on the front page, section fronts and article pages — responsive across mobile and desktop.",
  },
  {
    Icon: Target,
    title: "Sponsored Stories",
    body: "Clearly labelled branded journalism written to GhanaFeed's editorial standards and distributed like any lead story.",
  },
  {
    Icon: Users,
    title: "Newsletter Sponsorship",
    body: "Own the top slot in The Morning Feed and land directly in the inbox of readers who start their day with Ghanaian news.",
  },
];

function AdvertisePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-1 w-20 flag-bar" />
      <h1 className="mt-5 font-display text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl">
        Advertise with GhanaFeed
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        GhanaFeed reaches readers across Accra and the diaspora who come for politics, business,
        sport and culture. Partner with a newsroom people trust — and reach them where the
        conversation happens.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {FORMATS.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-md border border-border bg-surface p-6">
            <Icon className="h-5 w-5 text-gf-gold" />
            <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="border-b border-border pb-3 font-display text-2xl font-black uppercase tracking-tight">
            Talk to our team
          </h2>
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gf-red" />
              <a href="mailto:info@ghanafeed.com" className="hover:text-foreground">
                info@ghanafeed.com
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gf-red" />
              <a href="tel:0557024346" className="hover:text-foreground">
                055 702 4346
              </a>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gf-red" />
              WhatsApp: 055 702 4341
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gf-red" />
              St. 4352, Greater Accra, Ghana
            </li>
          </ul>
          <a
            href="mailto:info@ghanafeed.com?subject=Advertising%20enquiry"
            className="mt-7 inline-block rounded-sm bg-gf-red px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Request the media kit
          </a>
        </section>
        <div className="lg:col-span-5">
          <NewsletterCard />
        </div>
      </div>
    </div>
  );
}
