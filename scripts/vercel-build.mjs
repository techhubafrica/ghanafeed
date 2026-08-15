/**
 * Builds the app for Vercel using the Build Output API (v3).
 *
 * Vite/TanStack Start emits:
 *   dist/client        -> static assets
 *   dist/server/server.js -> { fetch(request): Response }
 *
 * We repackage that into .vercel/output so Vercel serves the static files
 * from its CDN and routes everything else to a single SSR function.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, ".vercel", "output");
const fn = path.join(out, "functions", "index.func");

execSync("vite build", {
  stdio: "inherit",
  env: { ...process.env, DEPLOY_TARGET: "vercel" },
});

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(fn, { recursive: true });

// Static assets
fs.cpSync(path.join(root, "dist", "client"), path.join(out, "static"), {
  recursive: true,
});

// SSR function bundle
fs.cpSync(path.join(root, "dist", "server"), path.join(fn, "server"), {
  recursive: true,
});

fs.writeFileSync(
  path.join(fn, "index.mjs"),
  [
    "import server from './server/server.js';",
    "export default function handler(request) {",
    "  return server.fetch(request);",
    "}",
    "",
  ].join("\n"),
);

fs.writeFileSync(
  path.join(fn, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);

fs.writeFileSync(
  path.join(fn, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

fs.writeFileSync(
  path.join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2,
  ),
);

console.log("Vercel build output ready at .vercel/output");
