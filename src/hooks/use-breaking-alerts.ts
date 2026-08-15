import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { homeFeedQuery } from "@/lib/ghanafeed.queries";

const STORAGE_KEY = "gf:alerts";
const SEEN_KEY = "gf:alerts:seen";

type Permission = "default" | "granted" | "denied" | "unsupported";

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
    setPermission(supported ? (Notification.permission as Permission) : "unsupported");
    setEnabled(supported && window.localStorage.getItem(STORAGE_KEY) === "on");
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      if (raw) seen.current = new Set(JSON.parse(raw) as number[]);
    } catch {
      /* ignore malformed cache */
    }
  }, []);

  const { data } = useQuery({ ...homeFeedQuery(), enabled });

  useEffect(() => {
    if (!enabled || permission !== "granted" || !data?.posts?.length) return;

    const posts = data.posts.slice(0, 10);

    // First pass after enabling only records what's already published.
    if (!primed.current) {
      primed.current = true;
      posts.forEach((p) => seen.current.add(p.id));
      persist(seen.current);
      return;
    }

    const fresh = posts.filter((p) => !seen.current.has(p.id)).slice(0, 3);
    fresh.forEach((post) => {
      seen.current.add(post.id);
      try {
        const notification = new Notification("GhanaFeed — Breaking", {
          body: post.title,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: `gf-${post.id}`,
        });
        notification.onclick = () => {
          window.focus();
          window.location.href = `/article/${post.slug}`;
        };
      } catch {
        /* notification construction can fail on some mobile browsers */
      }
    });
    if (fresh.length) persist(seen.current);
  }, [data, enabled, permission]);

  const toggle = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (enabled) {
      setEnabled(false);
      primed.current = false;
      window.localStorage.setItem(STORAGE_KEY, "off");
      return;
    }

    let result = Notification.permission as Permission;
    if (result === "default") result = (await Notification.requestPermission()) as Permission;
    setPermission(result);
    if (result !== "granted") return;

    primed.current = false;
    setEnabled(true);
    window.localStorage.setItem(STORAGE_KEY, "on");
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
