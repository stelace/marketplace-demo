import { keyBy, uniqBy, compact } from 'lodash'
import * as types from 'src/store/mutation-types'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as api from './api'

import {
  isRatingOptional,
} from 'src/utils/rating'

export async function fetchRatingsStatsByType ({ commit, rootGetters }, { targetId }) {
  const ratingsOptions = rootGetters.ratingsOptions
  const ratingTypes = Object.keys(ratingsOptions.stats)

  const ratingsStatsByType = await api.fetchRatingsStatsByType({ targetId, groupBy: 'targetId', ratingsOptions })

  ratingTypes.forEach(ratingType => {
    commit({
      type: types.SET_RATING_STATS,
      ratingsStats: ratingsStatsByType[ratingType],
      ratingType
    })
  })

  return ratingsStatsByType
}

/**
 * doesn't store the result into vuex store
 * result format:
 * [
 *
 *
 *   {
 *     owner: owner1,
 *     rating: rating1,
 *     assetName: assetName1,
 *     transactionDuration: duration1
 *   },
 *   {
 *     owner: owner2,
 *     rating: rating2,
 *     ...
 *   }
 *   ...
 * }
 */
export async function fetchRatingsByTransaction ({ rootGetters }, { targetId }) {
  const fetchRatings = (...args) => stelace.ratings.list(...args)

  const ratings = await fetchAllResults(fetchRatings, { targetId, label: 'main' })

  const usersIds = uniqBy(compact(ratings.map(rating => rating.authorId)))

  const fetchUsersRequest = (...args) => stelace.users.list(...args)

  const users = await fetchAllResults(fetchUsersRequest, { id: usersIds })
  const usersById = keyBy(users, 'id')

  return ratings.map(rating => {
    return {
      rating,
      owner: usersById[rating.authorId],
      apiScore: rating.score,
      assetName: rating.metadata.assetName,
      transactionDuration: rating.metadata.transactionDuration
    }
  })
}

export async function fetchRatedTransactions ({ commit, rootGetters }, { transactionsIds }) {
  const ratingsOptions = rootGetters.ratingsOptions
  const nbEditableRatings = Object.keys(ratingsOptions.types).reduce((memo, key) => {
    if (!isRatingOptional(ratingsOptions.types[key])) memo += 1
    return memo
  }, 0)

  const ratingsStats = await api.fetchRatingsStats({
    transactionId: transactionsIds,
    groupBy: 'transactionId'
  })

  const ratingsStatsByTransactionId = keyBy(ratingsStats, 'transactionId')

  const ratedTransactions = {}

  transactionsIds.forEach(transactionId => {
    const stats = ratingsStatsByTransactionId[transactionId]
    if (!stats) {
      ratedTransactions[transactionId] = false
    } else {
      ratedTransactions[transactionId] = ratingsStatsByTransactionId[transactionId].count >= nbEditableRatings
    }
  })

  commit({
    type: types.SET_RATED_TRANSACTIONS,
    ratedTransactions
  })
}

export async function fetchRatings ({ commit }, { transactionId }) {
  const ratings = await stelace.ratings.list({ transactionId })
  return ratings
}

export async function createRating ({ commit }, { attrs }) {
  const rating = await stelace.ratings.create(attrs)
  return rating
}
