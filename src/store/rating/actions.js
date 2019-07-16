import { get, keyBy, uniqBy, values, compact, groupBy } from 'lodash'
import * as types from 'src/store/mutation-types'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as api from './api'
import { populateUser } from 'src/utils/user'

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
 *   {
 *     transactionId: transactionId1,
 *     transaction: transaction1,
 *     owner: owner1,
 *     ratingsStats: {
 *       [ratingsStatsLabel1]: ratingsStats1,
 *       [ratingsStatsLabel2]: ratingsStats2
 *     },
 *     ratings: {
 *       [ratingLabel1]: rating1,
 *       [ratingLabel2]: rating2,
 *       [ratingLabel3]: rating3
 *     }
 *   },
 *   {
 *     transactionId: transactionId2,
 *     ...
 *   }
 *   ...
 * }
 */
export async function fetchRatingsStatsByTransaction ({ rootGetters }, { targetId }) {
  const ratingsOptions = rootGetters.ratingsOptions
  const ratingTypes = Object.keys(ratingsOptions.stats)

  const fetchRatings = (...args) => stelace.ratings.list(...args)

  const [
    ratingsStatsByType,
    ratings
  ] = await Promise.all([
    api.fetchRatingsStatsByType({ targetId, groupBy: 'transactionId', ratingsOptions }),
    fetchAllResults(fetchRatings, { targetId })
  ])

  const groupedRatings = groupBy(ratings, 'transactionId')

  const result = {}

  ratingTypes.forEach(ratingType => {
    const statsByType = ratingsStatsByType[ratingType]

    statsByType.forEach(transactionStats => {
      result[transactionStats.transactionId] = result[transactionStats.transactionId] || {
        stats: {},
        ratings: groupedRatings[transactionStats.transactionId] || [],
        transactionId: transactionStats.transactionId
      }
      result[transactionStats.transactionId].stats[ratingType] = transactionStats
    })
  })

  const statsByTransaction = values(result)

  const fetchTransactionsRequest = (...args) => stelace.transactions.list(...args)
  const fetchUsersRequest = (...args) => stelace.users.list(...args)

  const transactionsIds = compact(statsByTransaction.map(stat => stat.transactionId))

  // needs to filter on `targetId` for taker who can only have the permission 'transaction:list' (without 'all')
  const transactions = await fetchAllResults(fetchTransactionsRequest, { id: transactionsIds, takerId: targetId })

  const usersIds = uniqBy(compact(transactions.map(transaction => transaction.ownerId)))

  const users = await fetchAllResults(fetchUsersRequest, { id: usersIds })

  const transactionsById = keyBy(transactions, 'id')
  const usersById = keyBy(users, 'id')

  statsByTransaction.forEach(stat => {
    stat.transaction = transactionsById[stat.transactionId]

    const ownerId = get(stat.transaction, 'ownerId')
    stat.owner = usersById[ownerId]
    if (stat.owner) {
      populateUser(stat.owner)
    }
  })

  return statsByTransaction
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
