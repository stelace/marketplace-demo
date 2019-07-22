import { get, keyBy } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.SET_RATING_STATS_BY_TARGET_ID] (state, { ratingsStats, ratingType = 'default' }) {
    const currentStats = Object.assign({}, get(state.ratingsStatsByTargetId, ratingType, {}))
    const newStats = keyBy(ratingsStats, 'targetId')

    // keep old target IDs, unless they are overriden by new ones with same target IDs
    Object.keys(newStats).forEach(targetId => {
      currentStats[targetId] = newStats[targetId]
    })

    state.ratingsStatsByTargetId = Object.assign({}, state.ratingsStatsByTargetId, {
      [ratingType]: currentStats
    })
  },

  [types.SET_RATING_STATS_BY_ASSET_ID] (state, { ratingsStats, ratingType = 'default' }) {
    const currentStats = Object.assign({}, get(state.ratingsStatsByAssetId, ratingType, {}))
    const newStats = keyBy(ratingsStats, 'assetId')

    // keep old asset IDs, unless they are overriden by new ones with same asset IDs
    Object.keys(newStats).forEach(assetId => {
      currentStats[assetId] = newStats[assetId]
    })

    state.ratingsStatsByAssetId = Object.assign({}, state.ratingsStatsByAssetId, {
      [ratingType]: currentStats
    })
  },

  [types.SET_RATED_TRANSACTIONS] (state, { ratedTransactions }) {
    state.ratedTransactionsById = Object.assign({}, state.ratedTransactionsById, ratedTransactions)
  },
}
