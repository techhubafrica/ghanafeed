import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { homeFeedQuery } from "@/lib/ghanafeed.queries";

const STORAGE_KEY = "gf:alerts";
const SEEN_KEY = "gf:alerts:seen";

type Permission = "default" | "granted" | "denied" | "unsupported";

/**
 * Dispatch a notification using the service worker (required for mobile/PWA),
 * falling back to the standard Notification constructor.
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions & { url?: string }
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const targetUrl = options?.url
    ? new URL(options.url, window.location.origin).href
    : window.location.href;

  const notificationOptions: NotificationOptions = {
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    ...options,
    data: {
      url: targetUrl,
      ...(options?.data || {}),
    },
  };

  // 1. Service Worker showNotification (works on Android Chrome, desktop, PWA)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    } catch {
      /* fallback to window.Notification */
    }
  }

  // 2. Standard Notification constructor
  try {
    const notification = new Notification(title, notificationOptions);
    notification.onclick = () => {
      window.focus();
      window.location.href = targetUrl;
    };
    return true;
  } catch {
    return false;
  }
}

/**
 * Breaking-news alerts: while GhanaFeed is open (or running as an installed
 * app), new headlines from the live feed surface as system notifications.
 */
export function useBreakingAlerts() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<Permission>("default");
  const seen = useRef<Set<number>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window;
    const currentPermission = supported ? (Notification.permission as Permission) : "unsupported";
    setPermission(currentPermission);
    setEnabled(supported && currentPermission === "granted" && window.localStorage.getItem(STORAGE_KEY) === "on");
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      if (raw) seen.current = new Set(JSON.parse(raw) as number[]);
    } catch {
      /* ignore malformed cache */
    }
  }, []);

  // Poll for fresh breaking stories every 60s when alerts are enabled
  const { data } = useQuery({
    ...homeFeedQuery(),
    refetchInterval: enabled ? 60000 : false,
  });

  useEffect(() => {
    if (!enabled || permission !== "granted" || !data?.posts?.length) return;

    const posts = data.posts.slice(0, 10);

    // First pass after enabling records what's already published so we don't spam.
    if (!primed.current) {
      primed.current = true;
      posts.forEach((p) => seen.current.add(p.id));
      persist(seen.current);
      return;
    }

    const fresh = posts.filter((p) => !seen.current.has(p.id)).slice(0, 2);
    fresh.forEach((post) => {
      seen.current.add(post.id);
      void sendNotification("GhanaFeed — Breaking", {
        body: post.title,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `gf-${post.id}`,
        url: `/article/${post.slug}`,
      });
    });
    if (fresh.length) persist(seen.current);
  }, [data, enabled, permission]);

  const toggle = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      toast.info(
        "To receive alerts on iOS: tap the Share button (square with arrow) and select 'Add to Home Screen'.",
        { duration: 6000 }
      );
      return;
    }

    if (Notification.permission === "denied") {
      toast.error(
        "Notifications are blocked in your browser settings. Please allow notifications for GhanaFeed to receive alerts.",
        { duration: 6000 }
      );
      setPermission("denied");
      return;
    }

    if (enabled) {
      setEnabled(false);
      primed.current = false;
      window.localStorage.setItem(STORAGE_KEY, "off");
      toast("Breaking news alerts turned off");
      return;
    }

    let perm = Notification.permission as Permission;
    if (perm === "default") {
      try {
        perm = (await Notification.requestPermission()) as Permission;
      } catch {
        /* some older browsers require callback */
        perm = await new Promise((resolve) => Notification.requestPermission(resolve as any));
      }
    }

    setPermission(perm);

    if (perm === "granted") {
      primed.current = false;
      setEnabled(true);
      window.localStorage.setItem(STORAGE_KEY, "on");
      toast.success("Breaking news alerts activated!");

      // Dispatch an instant welcome notification to confirm functionality
      void sendNotification("GhanaFeed — Breaking Alerts Active 🔔", {
        body: "You will now receive notifications as top breaking stories unfold.",
        tag: "gf-welcome",
        url: "/",
      });
    } else if (perm === "denied") {
      toast.error(
        "Notification permission was denied. You can re-enable it anytime in your browser site settings."
      );
    }
  }, [enabled]);

  return { enabled, permission, toggle };
}

function persist(ids: Set<number>) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...ids].slice(-60)));
  } catch {
    /* storage may be full or blocked */
  }
}
