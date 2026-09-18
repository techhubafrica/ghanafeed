import { Bell, BellRing } from "lucide-react";
import { useBreakingAlerts } from "@/hooks/use-breaking-alerts";

/** Small bell control that opts the reader into breaking-news notifications. */
export function AlertsToggle({ className = "" }: { className?: string }) {
  const { enabled, permission, toggle } = useBreakingAlerts();

  const denied = permission === "denied";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      title={
        denied
          ? "Notifications are blocked in your browser settings"
          : enabled
            ? "Breaking-news alerts on"
            : "Get breaking-news alerts"
      }
      aria-label={enabled ? "Turn off breaking-news alerts" : "Turn on breaking-news alerts"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
        enabled
          ? "border-gf-red text-gf-red"
          : "border-border text-muted-foreground hover:border-gf-gold hover:text-foreground"
      } ${className}`}
    >
      {enabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  );
}
