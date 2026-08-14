import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native wrapper config for the iOS / Android builds of GhanaFeed.
 * The app is server-rendered, so the native shell loads the live site
 * (published URL) instead of a static bundle. Update `server.url` if the
 * production domain changes.
 */
const config: CapacitorConfig = {
  appId: "com.ghanafeed.app",
  appName: "GhanaFeed",
  webDir: "dist/client",
  server: {
    url: "https://ghanafeed.lovable.app",
    cleartext: false,
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
  },
  android: {
    backgroundColor: "#ffffff",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
