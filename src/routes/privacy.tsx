import { createFileRoute } from "@tanstack/react-router";
import { EXTERNAL_LINKS } from "@/lib/ghanafeed";

const DESCRIPTION =
  "How GhanaFeed collects, uses, shares and protects your personal information when you read or interact with our news platform.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GhanaFeed" },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "Privacy Policy — GhanaFeed" },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy — GhanaFeed" },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gf-gold">
        GhanaFeed
      </p>
      <h1 className="mt-2 font-display text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <div className="mt-4 h-1 w-24 flag-bar" />

      <Section title="Who we are">
        <p>
          GhanaFeed is an independent digital news platform focused on delivering credible and
          engaging news content. If you have any questions about this policy, you can contact us
          at{" "}
          <a href={EXTERNAL_LINKS.email} className="text-gf-red hover:underline">
            info@ghanafeed.com
          </a>
          .
        </p>
      </Section>

      <Section title="Information we collect">
        <p>
          <strong className="text-foreground">Comments.</strong> When you leave a comment, we
          collect the information you provide in the form (such as your name and email), along
          with your IP address and browser details. We use this to manage comments and help
          prevent spam. If you use Gravatar, an anonymised version of your email may be sent to
          that service so your profile picture can appear next to your comment.
        </p>
        <p>
          <strong className="text-foreground">Media uploads.</strong> If you upload images, we
          recommend removing any location data, because others may be able to download and
          extract that information from the image.
        </p>
        <p>
          <strong className="text-foreground">Contacting us.</strong> If you get in touch through
          our contact forms, we collect your name, email address and message so we can respond to
          you. We do not use this information for anything else.
        </p>
        <p>
          <strong className="text-foreground">Newsletter.</strong> If you subscribe, we store your
          email address only to send you our newsletter. You can ask us to remove it at any time.
        </p>
      </Section>

      <Section title="Cookies">
        <p>We use cookies to make your experience on GhanaFeed smoother and more convenient.</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Comment cookies remember your details so you don't have to re-enter them.</li>
          <li>Login cookies help manage your session if you have an account.</li>
          <li>Editor cookies store basic information when articles are edited.</li>
        </ul>
        <p>You can control or disable cookies through your browser settings if you prefer.</p>
      </Section>

      <Section title="Content from other websites">
        <p>
          Some articles may include embedded content such as videos or social media posts. These
          behave just like visiting the original website, which means those sites may collect data
          about you, use cookies or track your interaction.
        </p>
      </Section>

      <Section title="How we use data">
        <ul className="ml-5 list-disc space-y-1">
          <li>Keep the website running smoothly</li>
          <li>Respond to messages and enquiries</li>
          <li>Understand how people use our content</li>
          <li>Improve the overall user experience</li>
        </ul>
      </Section>

      <Section title="Sharing your information">
        <p>
          We do not sell your personal data. We may share limited information with trusted
          services that help us run the site, such as spam filtering tools, website analytics
          providers, and hosting or technical support services. These providers only use the data
          they need to perform their roles.
        </p>
      </Section>

      <Section title="How long we keep your data">
        <p>
          Comments are usually kept so conversations can continue and follow-up comments can be
          approved automatically. If you have an account, your personal details are stored in your
          profile and you can view, edit or delete them at any time (except your username). In
          some cases we may keep certain data for security or administrative reasons.
        </p>
      </Section>

      <Section title="Your choices">
        <p>You have control over your information. You can:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Ask us for a copy of your data</li>
          <li>Request corrections</li>
          <li>Ask for your data to be deleted where possible</li>
        </ul>
        <p>Just contact us and we'll do our best to help.</p>
      </Section>

      <Section title="Where your data goes">
        <p>
          Comments may be checked through automated spam detection services, which could be based
          outside your country.
        </p>
      </Section>

      <Section title="Keeping your data safe">
        <p>
          We take security seriously and use appropriate measures to protect your information,
          including secure systems and limited access to data.
        </p>
      </Section>

      <Section title="If something goes wrong">
        <p>
          If there is ever a data breach, we will investigate it quickly, fix the issue and inform
          affected users where necessary.
        </p>
      </Section>

      <Section title="Updates to this policy">
        <p>
          We may update this policy from time to time. Any major changes will be posted on this
          page.
        </p>
      </Section>

      <Section title="Get in touch">
        <p>
          Questions about how we handle your data? Email{" "}
          <a href={EXTERNAL_LINKS.email} className="text-gf-red hover:underline">
            info@ghanafeed.com
          </a>{" "}
          or call{" "}
          <a href={EXTERNAL_LINKS.phone} className="text-gf-red hover:underline">
            055 702 4346
          </a>
          . Address: 6 Abayateye Street, East Legon, Accra.
        </p>
        <p className="font-medium text-foreground">
          By using GhanaFeed, you agree to this Privacy Policy.
        </p>
      </Section>
    </div>
  );
}
