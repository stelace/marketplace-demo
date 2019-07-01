import { keyBy } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.SET_LOCAL_ENTRIES] (state, { entries }) {
    state.localEntries = entries
  },

  [types.SET_API_ENTRIES] (state, { entries }) {
    state.apiEntries = keyBy(entries, 'id')
  },

  [types.SET_LOCALE] (state, { locale }) {
    state.locale = locale
  },
  [types.SET_CURRENCY] (state, { currency }) {
    state.currency = currency
  },
  [types.FETCHING_CONTENT] (state, { status }) {
    state.fetchingContentStatus = status
  },

  [types.ROUTES_ADDED] (state, { paths = [] }) {
    state.addedRoutes = [...state.addedRoutes, ...paths]
  },

  [types.SET_APP_UPDATE_AVAILABLE] (state, { noCache }) {
    state.appUpdateAvailable = true
    state.appUpdateNoCache = noCache
  },

  [types.SET_ACCEPT_WEBP] (state, { accept = true } = {}) {
    state.acceptWebP = accept
  },
}
