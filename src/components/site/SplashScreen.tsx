import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduce ? 300 : 1500;
    const t1 = window.setTimeout(() => setLeaving(true), hold);
    const t2 = window.setTimeout(() => setVisible(false), hold + 600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{ backgroundColor: "var(--background)" }}
      className={`gf-splash fixed inset-0 z-[200] flex flex-col items-center justify-center ${
        leaving ? "gf-splash-out" : ""
      }`}
    >
      <div className="gf-splash-glow" />

      <div className="relative flex flex-col items-center px-8">
        <div className="gf-splash-logo">
          <img
            src="/ghanafeed-logo.png"
            alt=""
            width={520}
            height={160}
            className="h-16 w-auto sm:h-20"
            fetchPriority="high"
          />
        </div>

        <p className="gf-splash-tag mt-5 font-mono text-[0.66rem] uppercase tracking-[0.42em] text-muted-foreground">
          Fearless Journalism
        </p>

        <div className="gf-splash-bar mt-8 h-[3px] w-44 overflow-hidden rounded-full bg-border sm:w-56">
          <span className="gf-splash-fill block h-full w-full rounded-full" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
        <span className="flex-1 bg-gf-red" />
        <span className="flex-1 bg-gf-gold" />
        <span className="flex-1 bg-gf-green" />
      </div>
    </div>
  );
}
