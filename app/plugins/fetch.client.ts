/**
 * Global $fetch interceptor.
 *
 * Automatically adds the `X-Requested-With: XMLHttpRequest` header to every
 * outgoing API request. This satisfies the CSRF middleware which requires
 * the header on all state-changing methods (POST, PUT, PATCH, DELETE).
 *
 * Runs client-side only — server-side $fetch calls don't go through CSRF.
 */
export default defineNuxtPlugin(() => {
  const { $fetch: _fetch } = useNuxtApp()

  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      const headers = options.headers ||= {}

      // Normalise to Headers object if needed
      if (Array.isArray(headers)) {
        headers.push(['X-Requested-With', 'XMLHttpRequest'])
      } else if (headers instanceof Headers) {
        headers.set('X-Requested-With', 'XMLHttpRequest')
      } else {
        (headers as Record<string, string>)['X-Requested-With'] = 'XMLHttpRequest'
      }
    },
  }) as typeof $fetch
})
