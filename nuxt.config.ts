import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  devtools: { enabled: true },

  nitro: {
    preset: "netlify",
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Quicksand: [300, 400, 500, 600, 700],
        },
        display: "swap",
        preload: true,
      },
    ],
  ],

  runtimeConfig: {
    public: {
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      },
    },
  },

  vite: {
    plugins: [
      vuetify({
        autoImport: true,
      }),
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  ssr: false,
  compatibilityDate: "2024-11-27",

  css: [
    "@/assets/custom.sass",
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "@/assets/font.scss",
    "@/assets/global.scss",
  ],
});
