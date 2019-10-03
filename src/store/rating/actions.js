import { keyBy, uniqBy, compact } from 'lodash'
import * as types from 'src/store/mutation-types'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as api from './api'

import {
  isRatingOptional,
} from 'src/utils/rating'
import { populateUser } from 'src/utils/user'

export async function fetchRatingsStats ({ commit, rootGetters }, { assetId, targetId, groupBy }) {
  const ratingsOptions = rootGetters.ratingsOptions
  const ratingTypes = Object.keys(ratingsOptions.stats)

  const allowedGroupByValues = ['assetId', 'targetId']

  if (!allowedGroupByValues.includes(groupBy)) {
    throw new Error(`Allowed values for groupBy: ${allowedGroupByValues.join(', ')}`)
  }

  const ratingsStatsByType = await api.fetchRatingsStatsByType({ assetId, targetId, groupBy, ratingsOptions })

  let type
  if (groupBy === 'targetId') {
    type = types.SET_RATING_STATS_BY_TARGET_ID
  } else if (groupBy === 'assetId') {
    type = types.SET_RATING_STATS_BY_ASSET_ID
  }

  ratingTypes.forEach(ratingType => {
    commit({
      type,
      ratingsStats: ratingsStatsByType[ratingType],
      ratingType
    })
  })

  return ratingsStatsByType
}

/**
 * Returns an array of ratings with property owner added
 */
export async function fetchRatingsByTransaction ({ rootGetters }, { targetId, assetId }) {
  const fetchRatings = (...args) => stelace.ratings.list(...args)

  const ratings = await fetchAllResults(fetchRatings, { targetId, assetId, label: 'main' })

  const usersIds = uniqBy(compact(ratings.map(rating => rating.authorId)))

  const fetchUsersRequest = (...args) => stelace.users.list(...args)

  const users = await fetchAllResults(fetchUsersRequest, { id: usersIds })
  users.forEach(user => populateUser(user)) // populate users to get avatar url

  const usersById = keyBy(users, 'id')

  return ratings.map(rating => {
    return Object.assign({}, rating, {
      owner: usersById[rating.authorId]
    })
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
