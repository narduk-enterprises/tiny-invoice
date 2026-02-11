import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],
  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  ui: {
    colorMode: true
  },

  colorMode: {
    preference: 'dark'
  },

  vite: {
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __APP_VERSION__: JSON.stringify(pkg.version)
    }
  },

  runtimeConfig: {
    // Server-only Polymarket secrets
    polymarketPrivateKey: process.env.POLYMARKET_PRIVATE_KEY || '',
    polymarketApiKey: process.env.POLYMARKET_API_KEY || '',
    polymarketSecret: process.env.POLYMARKET_SECRET || '',
    polymarketPassphrase: process.env.POLYMARKET_PASSPHRASE || '',
    polymarketProxyAddress: process.env.POLYMARKET_PROXY_ADDRESS || '',

    public: {
      appUrl: process.env.SITE_URL || 'https://polymarket-arb.pages.dev',
      posthogPublicKey: process.env.POSTHOG_PUBLIC_KEY || '',
      posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
      gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
      appName: process.env.APP_NAME || pkg.name || ''
    }
  },

  site: {
    url: 'https://polymarket-arb.pages.dev',
    name: 'Polymarket Arb'
  },

  sitemap: {
    sources: ['/api/sitemap-urls']
  },

  robots: {
    disallow: ['/api/']
  },

  nitro: {
    preset: 'cloudflare-pages',
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    // Inline drizzle-orm so it's bundled into the worker (not treated as external)
    externals: {
      inline: ['drizzle-orm']
    }
  },

  app: {
    head: {
      title: 'Polymarket Arb — Prediction Market Arbitrage Tracker',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Automated prediction market arbitrage scanner for Polymarket. Detects pricing inefficiencies, tracks opportunities, and monitors trades in real time.' },
        { name: 'keywords', content: 'polymarket, arbitrage, prediction markets, trading bot, arb scanner' },
        { property: 'og:title', content: 'Polymarket Arb — Prediction Market Arbitrage Tracker' },
        { property: 'og:description', content: 'Automated prediction market arbitrage scanner. Detects pricing inefficiencies in real time.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://polymarket-arb.pages.dev' },
        { property: 'og:site_name', content: 'Polymarket Arb' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Polymarket Arb — Prediction Market Arbitrage Tracker' },
        { name: 'twitter:description', content: 'Automated prediction market arbitrage scanner. Detects pricing inefficiencies in real time.' },
        { name: 'theme-color', content: '#0a0f1a' },
        { name: 'google-site-verification', content: '' }
      ],
      link: [
        { rel: 'canonical', href: 'https://polymarket-arb.pages.dev' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
