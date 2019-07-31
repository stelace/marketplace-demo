import Vue from 'vue'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import { Quasar } from 'quasar'
import { get, mapKeys, pickBy, uniq } from 'lodash'
import { testWebP } from 'sharp-aws-image-handler-client'

import * as types from 'src/store/mutation-types'
import { getCurrencyFraction } from 'src/utils/currencies'
import { router } from 'src/router'
import { dynamicRoutes } from 'src/router/routes'
import { defaultDelay } from 'src/mixins/notify'
import { makeSafeForUrl } from 'src/utils/string'
import logger from 'src/utils/logger'

const addedPagesEntry = 'instant_pages'
let routerGuard
let errorMessage

export async function fetchAppContent ({ state, commit, getters, dispatch }, { locale, currency }) {
  locale = locale || state.defaultLocale
  currency = currency || state.defaultCurrency

  commit({ type: types.FETCHING_CONTENT, status: true })

  const newCurrency = currency || state.currency

  const currencyFormat = {
    number: {
      currency: {
        style: 'currency',
        currency: newCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: getCurrencyFraction(newCurrency),
      }
    }
  }

  const dateTimeFormat = {
    date: {
      dateTime: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      },
      fullmonth: {
        month: 'long',
        year: 'numeric',
      },
    }
  }

  try {
    // In webpack config we instruct to only "preload" default language for faster initial loading
    // About using [request] in chunk name: https://github.com/webpack/webpack/issues/4807

    const loadDefaultTranslations = import(/* webpackChunkName: 'i18n-stl-[request]' */
      `src/i18n/build/${locale}.json`
    )
      .then(translations => {
        const localEntries = translations.default

        errorMessage = get(localEntries, 'error.unknown_happened_header', '')

        commit({
          type: types.SET_LOCAL_ENTRIES,
          entries: localEntries
        })
      })
      .catch(handleContentError)

    const [
      defaultTranslations, // eslint-disable-line
      acceptWebP
    ] = await Promise.all([
      loadDefaultTranslations,
      testWebP()
    ])

    // We do not wait for Quasar language pack since it’s not critical
    import(/* webpackChunkName: 'i18n-q-[request]' */
      `quasar/lang/${locale === 'en' ? 'en-us' : locale}`
    )
      .then(quasarTranslations => Quasar.lang.set(quasarTranslations.default))
      .catch(logger)

    // Content API translations are already included in build
    // and we just check for updates in a non-blocking way
    const entriesRequest = (...args) => stelace.entries.list(...args)

    fetchAllResults(entriesRequest, { collection: 'website', locale })
      .then(entries => {
        commit({ type: types.SET_API_ENTRIES, entries })
        commit({ type: types.SET_CONTENT_UPDATED_DATE })
        dispatch('registerNewPages')
      })
      .catch(handleContentError)

    if (acceptWebP) commit({ type: types.SET_ACCEPT_WEBP })

    dispatch('registerNewPages')
  } catch (err) {
    handleContentError(err)
  }

  Vue.registerMessages(locale, getters.entries)
  Vue.setLocale(locale)
  Vue.registerFormats(locale, currencyFormat)
  Vue.registerFormats(locale, dateTimeFormat)

  commit({ type: types.SET_LOCALE, locale })
  commit({ type: types.SET_CURRENCY, currency: newCurrency })
  commit({ type: types.FETCHING_CONTENT, status: false })

  return true
}

/**
 * This action enables dynamic routing and should be called when new Content API entries are loaded,
 * as long as they are likely to include new pages (routes) to add to vue-router.
 */
export function registerNewPages ({ state, commit, getters }) {
  const potentialPagesContents = getters.getContents(addedPagesEntry)
  const newPages = prepareForRouter(potentialPagesContents)
  addPagesToRouter(newPages, { commit, state })
}

function handleContentError (err) {
  logger(err, { notification: { // User should know the app is broken…
    message: errorMessage || 'Error',
    i18n: false,
    timeout: defaultDelay * 2
  } })
  return err // In prod we don’t throw to load other contents available
  // Returning error rather than throwing can be useful to keep Promise.all running other promises
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#Promise.all_fail-fast_behaviour
}

function prepareForRouter (pagesContents) {
  // keys look like instant_pages.about_us.content, instant_pages.about_us.INSTANT_PAGE_PATH…
  const pagesNames = uniq(Object.keys(pagesContents).map(k => k.split('.')[1]))

  return pagesNames.reduce((pagesForRouter, name) => {
    const pageKeyPrefix = `instant_pages.${name}.`
    const pageContents = pickBy(pagesContents, (v, k) => k.startsWith(pageKeyPrefix))
    const page = mapKeys(pageContents, (v, k) => k.replace(pageKeyPrefix, ''))

    if (page.content && page.header) {
      page.name = name
      pagesForRouter.push(page)
    }
    return pagesForRouter
  }, [])
}

function addPagesToRouter (newPages, { commit, state }) {
  const addedRoutesPaths = state.addedRoutes.slice(0) // copy to avoid referencing state here

  const newRoutes = newPages.map(p => {
    // entry p.INSTANT_PAGE_PATH can be set using Instant Content API to make sure the URL does not change for SEO
    // In this case make sure it’s consistent (generally, the same) across all languages to ensure appropriate routing
    const pathName = makeSafeForUrl(p.INSTANT_PAGE_PATH || p.name)

    return {
      name: pathName, // name is used for analytics
      path: pathName,
      // Note that global MainLayout is still used in parent route
      component: () => import(/* webpackChunkName: 'landing' */ 'pages/InstantPage.vue'),
      meta: {
        // To populate meta tags
        title: p.page_title || p.header,
        description: p.meta_description || '',
        // To load translations
        contentEntry: addedPagesEntry,
        contentPageName: p.name
      }
    }
  }).filter(r => !addedRoutesPaths.includes(r.path))

  if (!newRoutes.length) return

  dynamicRoutes.children = [...dynamicRoutes.children, ...newRoutes]
  router.addRoutes([dynamicRoutes])

  commit({
    // using store to make sure we don’t add routes indefinitely with SSR
    type: types.ROUTES_ADDED,
    paths: newRoutes.map(r => r.path)
  })

  if (typeof routerGuard === 'function') routerGuard() // unregister

  routerGuard = getRouterBeforeEachForcingToAddedPage(state.addedRoutes.slice(0))
}

function getRouterBeforeEachForcingToAddedPage (addedPaths) {
  // For an unknown reason vue-router matches catchAllRoute (404) and ignores added routes
  // when using browser back/forward buttons to return to added routes
  // despite this vue-router fix: https://github.com/vuejs/vue-router/commit/0fed2005c05b8706842a6d5249738fa081c8ba25
  // So we force proper behavior here, but we should pin down the exact cause.
  // Note that this bug occurs even when adding flat routes to router rather than nesting under
  // VUE_APP_INSTANT_PAGE_PREFIX like '/l'
  // This function also ensures 404 does not show up when an added route is first hit on website.
  router.beforeEach((to, from, next) => {
    const instantPageRegex = new RegExp(`^${process.env.VUE_APP_INSTANT_PAGE_PREFIX}/(.*)$`)
    const name = to.path.replace(instantPageRegex, '$1') // can’t nest instant pages currently
    const isAddedPage = addedPaths.includes(name)

    if (to.name === 'notFound' && isAddedPage) router.replace({ name })
    else next()
  })
}
