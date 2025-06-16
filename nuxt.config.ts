// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/device',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-og-image'
  ],

  ssr: true,

  devtools: {
    enabled: true
  },

  app: {
    rootId: 'app'
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      assetKey: process.env.NUXT_PUBLIC_ASSET_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-06-14',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // image: {
  //   domains: ['projectm-visualizer.org']
  // },

  icon: {
    provider: 'none',
    serverBundle: false,
    clientBundle: {
      scan: true,
      icons: [
        'lucide:menu',
        'lucide:chevron-down',
        'lucide:arrow-up-right',
        'lucide:arrow-right',
        'lucide:x',
        'lucide:hash',
        'lucide:sun',
        'lucide:moon',
        'lucide:book',
        'lucide:book-open',
        'lucide:book-text',
        'lucide:code-xml',
        'lucide:credit-card',
        'lucide:download',
        'lucide:equal-approximately',
        'lucide:folder-root',
        'lucide:git-fork',
        'lucide:newspaper',
        'lucide:pencil',
        'lucide:spline',
        'lucide:star',
        'simple-icons:apple',
        'simple-icons:codesandbox',
        'simple-icons:discord',
        'simple-icons:github',
        'simple-icons:linux',
        'simple-icons:mastodon',
        'simple-icons:stackblitz',
        'simple-icons:windows',
        'simple-icons:x',
        'simple-icons:youtube'
      ]
    }
  }
})
