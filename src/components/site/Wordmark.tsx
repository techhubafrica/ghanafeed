import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Typographic GhanaFeed lockup with the black star and flag underline. */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex flex-col items-start", className)} aria-label="GhanaFeed home">
      <span
        className={cn(
          "font-display font-black uppercase leading-none tracking-[-0.045em]",
          compact ? "text-lg" : "text-2xl sm:text-[1.75rem]",
        )}
      >
        <span className="text-foreground">Ghana</span>
        <span className="mx-[0.09em] inline-block translate-y-[-0.06em] text-gf-gold">★</span>
        <span className="text-gf-red">Feed</span>
      </span>
      {!compact && (
        <span className="mt-1 flex w-full items-center gap-1.5">
          <span className="h-[3px] flex-1 flag-bar" />
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
            Fearless
          </span>
        </span>
      )}
    </Link>
  );
}
