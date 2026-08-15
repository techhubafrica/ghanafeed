# GhanaFeed — Handover & Vercel Deployment

This app is a TanStack Start (React 19 + Vite 7) SSR app. All news content is
pulled live from `https://ghanafeed.com/wp-json/wp/v2` at request time, so the
app has **no content database**. The only backend usage is the newsletter
signup table.

---

## 1. Move the code to the client's GitHub

1. In Lovable: **GitHub → Connect / Export to GitHub** (this creates the repo
   under *your* account).
2. On your machine: `git clone <your-repo> ghanafeed && cd ghanafeed`
3. Point it at the client's repo and push:
   ```bash
   git remote set-url origin https://github.com/<client-org>/ghanafeed.git
   git push -u origin main
   ```
   (Or use GitHub's **Transfer ownership** in repo Settings — this keeps the
   history and issues and hands the repo over cleanly.)

Once it lives in their GitHub, Lovable is no longer required for hosting.

---

## 2. Deploy on Vercel

The repo is already Vercel-ready:

- `vercel.json` sets the build command.
- `scripts/vercel-build.mjs` builds with Vite and repackages the output into
  Vercel's Build Output API (`.vercel/output`): static assets on the CDN, one
  Node 22 SSR function for everything else (streaming enabled).
- `vite.config.ts` skips the Cloudflare Workers plugin when `VERCEL=1` or
  `DEPLOY_TARGET=vercel`.

Steps:

1. Vercel → **Add New → Project** → import the client's repo.
2. Framework preset: **Other** (`vercel.json` already handles it). Leave build
   command / output directory untouched.
3. Add the environment variables below.
4. Deploy. Add the custom domain (e.g. `app.ghanafeed.com`) under
   **Settings → Domains**.

Local check before pushing: `npm run build:vercel`.

### Environment variables (Vercel → Settings → Environment Variables)

| Variable | Needed for | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | newsletter | client-visible |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | newsletter | client-visible |
| `SUPABASE_URL` | newsletter (server) | same URL |
| `SUPABASE_SERVICE_ROLE_KEY` | newsletter insert | **secret**, server only |

> The current database is Lovable's managed backend, and its service-role key
> is not retrievable. For the client's own hosting, create a free Supabase
> project on their account, run the `newsletter_subscribers` migration in
> `supabase/migrations/`, and use that project's URL + keys here.
>
> If they don't want a database at all, the newsletter card can be swapped for
> a link to the signup form on ghanafeed.com and all four variables dropped.

---

## 3. What still needs a backend

- Newsletter subscribers (current)
- Future: comments, saved articles, accounts, push notifications

Everything else — articles, categories, tags, images, search, advertise/about/
contact/policy links, social links — is either fetched live from
ghanafeed.com or a direct outbound link.

---

## 4. Mobile app shells (optional)

`capacitor.config.ts` (appId `com.ghanafeed.app`) points the native iOS/Android
shells at the hosted site. After Vercel is live, set `server.url` in that file
to the production domain, then:

```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm run build && npx cap add ios && npx cap add android && npx cap sync
npx cap open ios      # Xcode → Archive → App Store Connect
npx cap open android  # Android Studio → Signed .aab → Play Console
```

Web updates then ship without a store resubmission.

---

## 5. Handover checklist

- [ ] Repo transferred to the client's GitHub org
- [ ] Client's own Supabase project (or newsletter removed)
- [ ] Vercel project on the client's account, env vars set
- [ ] Custom domain + HTTPS verified
- [ ] Apple Developer + Google Play accounts under the client's name
