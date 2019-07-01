import { keyBy } from 'lodash'
import * as types from 'src/store/mutation-types'

import { populateCustomAttributes } from 'src/utils/custom-attributes'

export default {
  [types.SET_ASSET_TYPES] (state, { assetTypes }) {
    state.assetTypesById = keyBy(assetTypes, 'id')
    state.assetTypesLastFetchedDate = new Date().toISOString()
  },

  [types.SET_CATEGORIES] (state, { categories }) {
    state.categoriesById = keyBy(categories, 'id')
    state.categoriesLastFetchedDate = new Date().toISOString()
  },

  [types.SET_FETCHING_CATEGORIES] (state, { fetching = true }) {
    state.fetchingCategories = fetching
  },

  [types.SET_ROLES] (state, { roles }) {
    state.rolesById = keyBy(roles, 'id')
    state.rolesLastFetchedDate = new Date().toISOString()
  },

  [types.SET_CUSTOM_ATTRIBUTES] (state, { customAttributes }) {
    const ca = populateCustomAttributes(customAttributes)
    state.customAttributesById = keyBy(ca, 'id')
    state.customAttributesLastFetchedDate = new Date().toISOString()
  },

  [types.SET_CONFIG] (state, { config }) {
    state.config = config
    state.configLastFetchedDate = new Date().toISOString()
  }
}
