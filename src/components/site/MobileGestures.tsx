import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { PRIMARY_NAV } from "@/lib/ghanafeed";

const PULL_THRESHOLD = 80;
const SWIPE_THRESHOLD = 70;

/**
 * Touch layer for phones:
 *  - swipe left/right to move between Home and the section pages
 *  - pull down at the very top of the page to refresh the feed
 */
export function MobileGestures({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const start = useRef<{ x: number; y: number; top: boolean } | null>(null);
  const axis = useRef<"none" | "x" | "y">("none");
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const indexOfPath = (path: string) => {
      if (path === "/") return 0;
      const m = /^\/c\/([^/]+)$/.exec(path);
      if (!m) return -1;
      return PRIMARY_NAV.findIndex((n) => "slug" in n && n.slug === m[1]);
    };

    const goTo = (i: number) => {
      const item = PRIMARY_NAV[i];
      if (!item) return;
      if ("to" in item) void navigate({ to: "/" });
      else void navigate({ to: "/c/$slug", params: { slug: item.slug } });
    };

    const onStart = (e: TouchEvent) => {
      if (window.innerWidth >= 1024 || e.touches.length !== 1) {
        start.current = null;
        return;
      }
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, top: window.scrollY <= 0 };
      axis.current = "none";
    };

    const onMove = (e: TouchEvent) => {
      const s = start.current;
      if (!s || refreshing) return;
      const t = e.touches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;

      if (axis.current === "none") {
        if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.6) axis.current = "x";
        else if (Math.abs(dy) > 12) axis.current = "y";
      }

      if (axis.current === "y" && s.top && dy > 0 && window.scrollY <= 0) {
        setPull(Math.min(dy * 0.5, PULL_THRESHOLD + 30));
      }
    };

    const onEnd = async (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;

      if (axis.current === "x" && Math.abs(dx) > SWIPE_THRESHOLD) {
        const i = indexOfPath(pathRef.current);
        if (i >= 0) goTo(dx < 0 ? Math.min(i + 1, PRIMARY_NAV.length - 1) : Math.max(i - 1, 0));
        setPull(0);
        return;
      }

      if (pull >= PULL_THRESHOLD) {
        setRefreshing(true);
        setPull(PULL_THRESHOLD);
        try {
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ["gf"], type: "active" }),
            router.invalidate(),
          ]);
        } finally {
          setRefreshing(false);
          setPull(0);
        }
        return;
      }

      setPull(0);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [navigate, pull, queryClient, refreshing, router]);

  const active = pull > 0 || refreshing;

  return (
    <>
      <div
        aria-hidden={!active}
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center lg:hidden"
        style={{ transform: `translateY(${active ? Math.max(pull, 44) : 0}px)`, opacity: active ? 1 : 0 }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm">
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin text-gf-red" />
          ) : (
            <RefreshCw
              className="h-4 w-4 text-gf-gold"
              style={{ transform: `rotate(${pull * 3}deg)` }}
            />
          )}
        </span>
      </div>
      <div style={{ transform: active ? `translateY(${Math.min(pull, 60)}px)` : undefined }}>
        {children}
      </div>
    </>
  );
}
