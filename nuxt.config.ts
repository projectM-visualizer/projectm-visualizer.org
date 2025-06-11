// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            noscript: [{ textContent: "JavaScript is required" }],
        },
        rootId: "app",
    },
  compatibilityDate: '2025-05-24',
  components: {
    dirs: []
  },
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4
  },
  ssr:false,
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@pinia/nuxt',
  ],
})