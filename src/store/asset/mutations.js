import Vue from 'vue'
import { keyBy } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.SET_ASSET] (state, { asset }) {
    state.asset = asset || {}
  },

  [types.SET_AVAILABILITIES] (state, { availabilities }) {
    state.availabilitiesById = keyBy(availabilities, 'id')
  },

  [types.SET_ACTIVE_ASSET] (state, { asset = {} }) {
    state.activeAsset = asset
  },

  [types.SET_USER_ASSETS] (state, { ownerId, assets = [] }) {
    Vue.set(state.usersAssets, ownerId, assets)
  },

  [types.SET_AVAILABILITY_GRAPH] (state, { assetId, availabilityGraph }) {
    Vue.set(state.availabilityGraphByAssetId, assetId, availabilityGraph)
  },
}
