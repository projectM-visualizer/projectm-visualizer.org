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
        'lucide:arrow-down',
        'lucide:arrow-left',
        'lucide:arrow-right',
        'lucide:arrow-up',
        'lucide:arrow-up-right',
        'lucide:book',
        'lucide:book-open',
        'lucide:book-text',
        'lucide:check',
        'lucide:chevron-down',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:chevron-up',
        'lucide:chevrons-left',
        'lucide:chevrons-right',
        'lucide:circle-alert',
        'lucide:circle-check',
        'lucide:circle-x',
        'lucide:code-xml',
        'lucide:copy',
        'lucide:copy-check',
        'lucide:credit-card',
        'lucide:download',
        'lucide:ellipsis',
        'lucide:equal-approximately',
        'lucide:eye',
        'lucide:eye-off',
        'lucide:file-text',
        'lucide:folder',
        'lucide:folder-open',
        'lucide:folder-root',
        'lucide:git-fork',
        'lucide:hash',
        'lucide:info',
        'lucide:lightbulb',
        'lucide:loader-circle',
        'lucide:menu',
        'lucide:minus',
        'lucide:monitor',
        'lucide:moon',
        'lucide:newspaper',
        'lucide:panel-left-close',
        'lucide:panel-left-open',
        'lucide:pencil',
        'lucide:plus',
        'lucide:rotate-ccw',
        'lucide:search',
        'lucide:spline',
        'lucide:square',
        'lucide:star',
        'lucide:sun',
        'lucide:triangle-alert',
        'lucide:x',
        'simple-icons:apple',
        'simple-icons:discord',
        'simple-icons:github',
        'simple-icons:linux',
        'simple-icons:mastodon',
        'simple-icons:windows',
        'simple-icons:x',
        'simple-icons:youtube'
      ]
    }
  }
})
