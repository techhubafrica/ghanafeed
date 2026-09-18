import fs from "fs";
import path from "path";

import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";


function devClientErrorLogger() {
  const VIRTUAL_ID = "virtual:dev-client-error-handler";
  const RESOLVED_ID = "\0" + VIRTUAL_ID;

  return {
    name: "dev-client-error-logger",
    apply: "serve" as const,
    enforce: "pre" as const,

    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id: string) {
      if (id !== RESOLVED_ID) return;
      return [
        "if (typeof window !== 'undefined' && import.meta.hot) {",
        "  const send = (d) => { try { import.meta.hot.send('client-runtime-error', d) } catch {} };",
        "  window.addEventListener('error', (e) => {",
        "    send({ type: 'runtime-error', message: e.message, stack: e.error?.stack, filename: e.filename, lineno: e.lineno, colno: e.colno });",
        "  });",
        "  window.addEventListener('unhandledrejection', (e) => {",
        "    const err = e.reason;",
        "    send({ type: 'unhandled-rejection', message: err?.message || String(err), stack: err?.stack });",
        "  });",
        "}",
      ].join("\n");
    },

    configureServer(server: import("vite").ViteDevServer) {
      const origConsoleError = console.error;
      let forwarding = false;
      console.error = (...args: unknown[]) => {
        origConsoleError.apply(console, args);
        if (forwarding) return;
        forwarding = true;
        try {
          const error = args[0];
          if (error instanceof Error) {
            server.ws.send({
              type: "custom",
              event: "client-runtime-error",
              data: {
                source: "ssr",
                type: "ssr-render-error",
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
            });
          }
        } finally {
          forwarding = false;
        }
      };

      server.ws.on(
        "client-runtime-error",
        (data: Record<string, string>) => {
          const { type, message, stack, filename, lineno, colno } = data;
          const label =
            type === "unhandled-rejection"
              ? "Unhandled Rejection"
              : "Runtime Error";
          let loc = "";
          if (filename) {
            loc = ` at ${filename}`;
            if (lineno != null) loc += `:${lineno}`;
            if (colno != null) loc += `:${colno}`;
          }
          server.config.logger.error(
            `\n[client] ${label}: ${message}${loc}`,
          );
          if (stack) {
            server.config.logger.error(stack);
          }

          server.ws.send({
            type: "custom",
            event: "client-runtime-error",
            data,
          });
        },
      );
    },

    transform(code: string, id: string) {
      const normalizedId = id.replace(/\\/g, "/");

      if (normalizedId.includes("routes/__root")) {
        return `import "${VIRTUAL_ID}";\n${code}`;
      }
    },
  };
}

function devServerFnErrorLogger() {
  const HMR_SEND_KEY = "__TANSTACK_SERVER_FN_HMR_SEND__";

  return {
    name: "dev-server-fn-error-logger",
    apply: "serve" as const,
    enforce: "pre" as const,
    configureServer(server: import("vite").ViteDevServer) {
      (globalThis as Record<string, unknown>)[HMR_SEND_KEY] = (data: unknown) => {
        server.ws.send({
          type: "custom",
          event: "server-fn-error",
          data,
        });
      };
    },
    transform(code: string, id: string) {
      const normalizedId = id.replace(/\\/g, "/");
      const isTargetModule =
        normalizedId.includes(
          "/@tanstack/start-server-core/src/server-functions-handler.ts",
        ) ||
        normalizedId.includes(
          "/@tanstack/start-server-core/dist/esm/server-functions-handler.js",
        );

      if (!isTargetModule) {
        return null;
      }

      const needle = "const unwrapped = res.result || res.error";
      if (!code.includes(needle)) {
        return null;
      }

      return code.replace(
        needle,
        `${needle}

      if (res?.error) {
        const err = res.error
        const payload = {
          source: 'tanstack',
          type: 'server-fn-error',
          method: request.method,
          url: request.url,
          name: err?.name ?? 'Error',
          message: err?.message ?? String(err),
          stack: typeof err?.stack === 'string' ? err.stack : undefined,
        }
        globalThis.${HMR_SEND_KEY}?.(payload)
      }`,
      );
    },
  };
}

/**
 * Generates the offline service worker against the built client output.
 * Workbox precaches the app shell/assets; navigations stay network-first so
 * fresh GhanaFeed stories always win when the reader is online.
 */
function offlineServiceWorker() {
  return {
    name: "gf-offline-service-worker",
    apply: "build" as const,
    enforce: "post" as const,
    async closeBundle() {
      const clientDir = path.resolve(__dirname, "dist/client");
      if (!fs.existsSync(path.join(clientDir, "index.html")) && !fs.existsSync(clientDir)) return;

      const { generateSW } = await import("workbox-build");
      await generateSW({
        swDest: path.join(clientDir, "sw.js"),
        globDirectory: clientDir,
        globPatterns: ["**/*.{js,css,ico,png,svg,webp,woff2}"],
        globIgnores: ["sw.js", "workbox-*.js"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "gf-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "gf-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/_serverFn/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "gf-feed",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 3 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      });

      const swPath = path.join(clientDir, "sw.js");
      if (fs.existsSync(swPath)) {
        const notifHandler = `
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
`;
        fs.appendFileSync(swPath, notifHandler, "utf-8");
      }
    },
  };
}

export default defineConfig(({ command }) => {

  // Vercel sets VERCEL=1 during its build; DEPLOY_TARGET can force it locally.
  const isVercel =
    process.env.DEPLOY_TARGET === "vercel" || process.env.VERCEL === "1";

  // Use Cloudflare Workers plugin for builds (produces worker output)
  // Skip for dev server (command=serve) since workerd runtime isn't available,
  // and skip on Vercel where TanStack Start emits Vercel functions instead.
  const useCloudflare = command === "build" && !isVercel;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      devClientErrorLogger(),
      devServerFnErrorLogger(),
      ...(useCloudflare ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
      tanstackStart(),

      viteReact(),
      // Provides the `virtual:pwa-register` module used by src/lib/pwa.ts.
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        filename: "sw.js",
        devOptions: { enabled: false },
        manifest: false,
      }),
      // The multi-environment (client + worker) build skips the plugin's own
      // service-worker emit, so generate it against dist/client afterwards.
      offlineServiceWorker(),


    ],
  };
});
