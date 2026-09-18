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

execSync("npx vite build", {
  stdio: "inherit",
  env: { ...process.env, DEPLOY_TARGET: "vercel" },
});

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(fn, { recursive: true });

// Static assets
fs.cpSync(path.join(root, "dist", "client"), path.join(out, "static"), {
  recursive: true,
});

// SSR function bundle — use esbuild to bundle server.js with all its
// node_module dependencies (e.g. h3-v2) inlined so the function is fully
// self-contained and doesn't need node_modules at runtime on Vercel.
fs.mkdirSync(path.join(fn, "server"), { recursive: true });
execSync(
  [
    "npx esbuild",
    path.join(root, "dist", "server", "server.js"),
    "--bundle",
    "--platform=node",
    "--format=esm",
    `--outfile=${path.join(fn, "server", "server.js")}`,
    "--packages=bundle",
    "--external:node:*",
    "--external:async_hooks",
    "--external:events",
    "--external:stream",
    "--external:buffer",
    "--external:util",
    "--external:url",
    "--external:path",
    "--external:fs",
    "--external:os",
    "--external:crypto",
    "--external:http",
    "--external:https",
    "--external:net",
    "--external:tls",
    "--external:zlib",
    "--log-level=info",
  ].join(" "),
  { stdio: "inherit", cwd: root }
);

fs.writeFileSync(
  path.join(fn, "index.mjs"),
  [
    "import server from './server/server.js';",
    "import { Readable } from 'node:stream';",
    "",
    "export default async function handler(req, res) {",
    "  try {",
    "    const protocol = req.headers['x-forwarded-proto'] || 'https';",
    "    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';",
    "    const url = new URL(req.url, `${protocol}://${host}`);",
    "",
    "    const headers = new Headers();",
    "    for (const [key, value] of Object.entries(req.headers)) {",
    "      if (value !== undefined) {",
    "        if (Array.isArray(value)) {",
    "          for (const v of value) headers.append(key, v);",
    "        } else {",
    "          headers.set(key, value);",
    "        }",
    "      }",
    "    }",
    "",
    "    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';",
    "    const body = hasBody ? Readable.toWeb(req) : undefined;",
    "",
    "    const request = new Request(url.toString(), {",
    "      method: req.method,",
    "      headers,",
    "      body,",
    "      duplex: hasBody ? 'half' : undefined,",
    "    });",
    "",
    "    const response = await server.fetch(request);",
    "",
    "    res.statusCode = response.status;",
    "    if (response.statusText) res.statusMessage = response.statusText;",
    "",
    "    for (const [key, val] of response.headers.entries()) {",
    "      if (key.toLowerCase() === 'set-cookie') {",
    "        const cookies = typeof response.headers.getSetCookie === 'function'",
    "          ? response.headers.getSetCookie()",
    "          : [val];",
    "        res.setHeader('Set-Cookie', cookies);",
    "      } else {",
    "        res.setHeader(key, val);",
    "      }",
    "    }",
    "",
    "    if (!response.body) {",
    "      res.end();",
    "      return;",
    "    }",
    "",
    "    Readable.fromWeb(response.body).pipe(res);",
    "  } catch (err) {",
    "    console.error('Vercel SSR Handler Error:', err);",
    "    if (!res.headersSent) {",
    "      res.statusCode = 500;",
    "      res.setHeader('Content-Type', 'text/plain');",
    "      res.end('Internal Server Error: ' + (err?.message || String(err)));",
    "    }",
    "  }",
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
