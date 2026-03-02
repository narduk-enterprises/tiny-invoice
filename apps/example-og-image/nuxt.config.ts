export default defineNuxtConfig({
  extends: ['@loganrenz/nuxt-v4-template-layer'],

  future: {
    compatibilityVersion: 4,
  },

  devServer: {
    port: 3015,
  },

  runtimeConfig: {
    public: {
      appUrl: process.env.SITE_URL || 'http://localhost:3015',
      appName: 'OG Image Example',
    },
  },

  site: {
    url: process.env.SITE_URL || 'http://localhost:3015',
    name: 'OG Image Example',
    description: 'Dynamic Open Graph image generation on Cloudflare Workers with nuxt-og-image v6 beta.',
    defaultLocale: 'en',
  },

  ogImage: {
    defaults: {
      component: 'OgPlaygroundTakumi',
    },
  },
})
