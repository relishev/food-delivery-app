import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.foody7.app",
  appName: "Foody7",
  // webDir is required by Capacitor CLI even in server.url mode
  // Content is never loaded from here (server.url takes precedence at runtime)
  webDir: "public",
  // REMOTE URL mode: native shell loads the live website
  // Advantage: SSR, Payload CMS, all API routes work unchanged
  // Requirement: internet connection (food delivery app always needs it anyway)
  server: {
    url: "https://foody7.com",
    cleartext: false, // HTTPS only
  },
  // Splash screen
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#f5821f",
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  // Android specific
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
  },
  // iOS specific
  ios: {
    contentInset: "automatic",
    backgroundColor: "#ffffff",
  },
};

export default config;
