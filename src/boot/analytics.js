// This file can be used for any analytics provider
import { get } from 'lodash'

const isProd = process.env.NODE_ENV === 'production'
const disableGoogleAnalyticsDebugging = process.env.VUE_APP_GOOGLE_ANALYTICS_DEBUG === 'false'

export default async ({ Vue, router, store }) => {
  let gaId = process.env.VUE_APP_GOOGLE_ANALYTICS_ID

  if (gaId === 'stelaceInstantConfig') {
    // Env variable is better for it is non-blocking
    const config = await store.dispatch('fetchConfig')
    gaId = get(config, 'stelace.instant.googleAnalyticsTrackingActive') &&
      get(config, 'stelace.instant.googleAnalyticsTrackingId')
  }

  if (!gaId) return

  const { default: VueAnalytics } = await import('vue-analytics')

  Vue.use(VueAnalytics, {
    // Unfortunately can’t add id asynchronously from store so we use an env variable
    // https://github.com/MatteoGabriele/vue-analytics/issues/111
    id: gaId,
    router,
    debug: {
      enabled: !isProd && !disableGoogleAnalyticsDebugging,
      sendHitTask: isProd
    },
    set: [
      { field: 'anonymizeIp', value: true } // Helps with GDPR compliance
    ],
    // Note that home path is '' as direct child of MainLayout '/'
    // ,
    autoTracking: {
      pageviewTemplate (route) {
        // This rule is needed to avoid duplicate events in all routes using Quasar preFetch.
        // For instance, hitting search '/s' first triggers a pageview event on route '/' with null name.
        // vue-analytics PR submitted since neither global `ignoreRoutes: ['/']`, ['mainLayout']
        // or `pageviewOnLoad: false` could help to fix this
        if (!route.name) return false

        return {
          page: route.path,
          title: route.name,
          location: window.location.href
        }
      }
    }
  })
  // Note: you may need to track initial page load manually in client when using SSR,
  // for which this file is not loaded (quasar.conf.js)
}
