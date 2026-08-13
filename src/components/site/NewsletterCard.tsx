import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";

export function NewsletterCard({ compact }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const subscribe = useServerFn(subscribeToNewsletter);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || value.length > 254) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await subscribe({ data: { email: value } });
      setEmail("");
      toast.success(
        res.alreadySubscribed
          ? "You're already on the list — thanks!"
          : "Subscribed. Ghana's headlines are on the way.",
      );
    } catch {
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className={compact ? "" : "rounded-md border border-border bg-surface p-6"}>
      <div className="mb-1 h-[3px] w-12 flag-bar" />
      <h3 className="mt-3 font-display text-lg font-black uppercase tracking-tight">
        The Morning Feed
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        Ghana's biggest stories, distilled and delivered before breakfast. No noise, no spin.
      </p>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-10 min-w-0 flex-1 rounded-sm border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-gf-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-gf-gold px-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Join
        </button>
      </form>
    </section>
  );
}
