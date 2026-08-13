import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logo from "@/assets/ghanafeed-logo.png.asset.json";

/** GhanaFeed brand lockup. */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="GhanaFeed home">
      <img
        src={logo.url}
        alt="GhanaFeed — Fearless Journalism"
        width={420}
        height={88}
        className={cn("w-auto transition-[height] duration-200", compact ? "h-7" : "h-9 sm:h-11")}
      />
    </Link>
  );
}
