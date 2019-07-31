import { keyBy, isNil } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.SET_LOCAL_ENTRIES] (state, { entries }) {
    state.localEntries = entries
  },

  [types.SET_API_ENTRIES] (state, { entries }) {
    state.apiEntries = keyBy(entries, 'name')
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

  [types.SET_CONTENT_EDITING] (state, { active, origin }) {
    state.contentEditing = active
    state.messageOrigin = origin
  },

  [types.SELECT_ENTRY] (state, { entry, field }) {
    state.selectedEntry = { entry, field }
  },

  [types.EDIT_ENTRY] (state, { entry, field, value, defaultValue }) {
    const newEditingEntries = Object.assign({}, state.editingEntries)
    newEditingEntries[entry] = newEditingEntries[entry] || {}

    if (isNil(value)) {
      newEditingEntries[entry][field] = defaultValue || null
    } else {
      newEditingEntries[entry][field] = value
    }

    state.editingEntries = newEditingEntries
  },

  [types.RESET_EDITING_ENTRIES] (state) {
    state.editingEntries = {}
  },

  [types.SET_CONTENT_UPDATED_DATE] (state) {
    state.lastContentUpdatedDate = new Date().toISOString()
  },
}
