import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Extend the published Narduk Nuxt Layer
  extends: ['@narduk-enterprises/narduk-nuxt-template-layer'],

  // nitro-cloudflare-dev proxies D1 bindings to the local dev server
  modules: ['nitro-cloudflare-dev'],

  nitro: {
    cloudflareDev: {
      configPath: resolve(__dirname, 'wrangler.json'),
    },
  },

  future: {
    compatibilityVersion: 4
  },

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'Plus Jakarta Sans', provider: 'google' },
    ],
  },

  runtimeConfig: {
    // Server-only (admin API routes)
    googleServiceAccountKey: process.env.GSC_SERVICE_ACCOUNT_JSON || '',
    posthogApiKey: process.env.POSTHOG_PERSONAL_API_KEY || '',
    gaPropertyId: process.env.GA_PROPERTY_ID || '',
    posthogProjectId: process.env.POSTHOG_PROJECT_ID || '',
    public: {
      appUrl: process.env.SITE_URL || 'https://tiny-invoice.nard.uk',
      appName: process.env.APP_NAME || 'TinyInvoice',
      // Analytics
      posthogPublicKey: process.env.POSTHOG_PUBLIC_KEY || '',
      posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
      gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
      posthogProjectId: process.env.POSTHOG_PROJECT_ID || '',
      // IndexNow
      indexNowKey: process.env.INDEXNOW_KEY || '',
    }
  },

  site: {
    url: process.env.SITE_URL || 'https://tiny-invoice.nard.uk',
    name: 'TinyInvoice',
    description: 'Professional invoicing for freelancers. Create invoices, manage clients, track payments.',
    defaultLocale: 'en',
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'TinyInvoice',
      url: process.env.SITE_URL || 'https://tiny-invoice.nard.uk',
      logo: '/favicon.svg',
    },
  },

  image: {
    cloudflare: {
      baseURL: process.env.SITE_URL || 'https://tiny-invoice.nard.uk',
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/login': { ssr: true },
    '/register': { ssr: true },
    '/dashboard': { ssr: true },
    '/clients': { ssr: true },
    '/invoices': { ssr: true },
    '/invoices/**': { ssr: true },
    '/settings': { ssr: true },
  },
})
