import { keyBy } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.SET_RATING_STATS] (state, { ratingsStats, ratingType = 'default' }) {
    state.ratingsStatsByType = Object.assign({}, state.ratingsStatsByType, {
      [ratingType]: keyBy(ratingsStats, 'targetId')
    })
  },

  [types.SET_RATED_TRANSACTIONS] (state, { ratedTransactions }) {
    state.ratedTransactionsById = Object.assign({}, state.ratedTransactionsById, ratedTransactions)
  },
}
