import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** GhanaFeed brand lockup. */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="GhanaFeed home">
      <img
        src="/ghanafeed-logo.png"
        alt="GhanaFeed — Fearless Journalism"
        width={840}
        height={176}
        className={cn("w-auto max-w-[190px] sm:max-w-none", compact ? "h-7" : "h-8 sm:h-11")}
      />
    </Link>
  );
}
