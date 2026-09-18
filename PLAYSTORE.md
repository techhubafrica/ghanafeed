# GhanaFeed — Google Play submission guide

The app is a web app wrapped in a native Android shell with Capacitor
(`capacitor.config.ts`, appId `com.ghanafeed.app`). The shell loads the live
site, so content updates without a new store release.

---

## 1. Before you build

1. Publish the web app (or deploy it to the client's own domain).
2. Open `capacitor.config.ts` and set `server.url` to the final production URL.
   It is set to `https://ghanafeed-one.vercel.app`.
3. You need on your machine: Node 20+, Java 17 (JDK), Android Studio.

## 2. Create the Android project

Run these from the project folder:

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npx cap sync android
npx cap open android    # opens Android Studio
```

`android/` is generated — commit it so future builds are reproducible.

## 3. App identity inside Android Studio

- App name: `android/app/src/main/res/values/strings.xml` → `GhanaFeed`
- Icons: right-click `res` → New → Image Asset → use `public/icon-1024.png`
- Version: `android/app/build.gradle` → `versionCode 1`, `versionName "1.0.0"`
  (bump `versionCode` on every upload)

## 4. Signing key (keep this safe forever)

```bash
keytool -genkey -v -keystore ghanafeed.keystore -alias ghanafeed \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store the keystore file and password in the client's password manager. Losing
it means never being able to update the listing.

In Android Studio: **Build → Generate Signed App Bundle** → Android App Bundle
→ select the keystore → release → produces `app-release.aab`.

## 5. Play Console

1. Create a Google Play developer account ($25 one-off) — register it in the
   **client's** name/company, not yours.
2. **Create app** → name `GhanaFeed`, English (US), App, Free.
3. Complete these sections (Play blocks release until all are green):
   - Privacy policy URL — must be a live page (e.g. `https://ghanafeed.com/privacy-policy/`)
   - App access — "All functionality available without restrictions"
   - Ads — declare yes if any ads appear on ghanafeed.com
   - Content rating questionnaire — News category
   - Target audience — 13+ (news content)
   - Data safety — the app collects email only if a reader subscribes to the newsletter
   - News apps declaration — Play asks publishers to confirm the publication
     and provide the website; use ghanafeed.com
4. Store listing assets:
   - App icon 512×512 → `public/icon-512.png`
   - Feature graphic 1024×500 → `store/play-feature-graphic.jpg`
   - At least 2 phone screenshots (16:9 or 9:16, min 1080px) — take them from
     the running app: home, an article, a section page
   - Short description (max 80 chars):
     `Breaking news from Ghana — politics, sports, business and culture.`
   - Full description: adapt the site's about text
5. **Production → Create new release** → upload the `.aab` → roll out.

First review typically takes 1–7 days. New developer accounts also need
closed testing with 12 testers for 14 days before production is unlocked —
plan for that.

## 6. Updates

Web changes go live instantly (the shell loads the hosted site). You only need
a new `.aab` when the native shell, icons, or permissions change:

```bash
npm run build && npx cap sync android
```

then bump `versionCode` and re-upload.
