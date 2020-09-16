import stelace, { fetchAllResults } from 'src/utils/stelace'
import p from 'src/utils/promise'
import { isEmpty } from 'lodash'

const fetchRatingsRequest = (...args) => stelace.ratings.list(...args)
const fetchRatingsStatsRequest = (...args) => stelace.ratings.getStats(...args)

export async function fetchRatingsStatsByType ({ assetId, targetId, transactionId, groupBy, ratingsOptions }) {
  const ratingTypes = Object.keys(ratingsOptions.stats)
  const ratingsStatsByType = {}

  for (let i = 0; i < ratingTypes.length; i++) {
    const ratingType = ratingTypes[i]
    const ratingConfig = ratingsOptions.stats[ratingType]

    ratingsStatsByType[ratingType] = await fetchRatingsStats({
      assetId,
      targetId,
      transactionId,
      groupBy,
      label: ratingConfig.labels.join(','),
    })
  }

  return ratingsStatsByType
}

export async function fetchRatingsStats ({ assetId, targetId, transactionId, groupBy, label }) {
  return fetchRatingsHelper({ assetId, targetId, transactionId, groupBy, label }, fetchRatingsStatsRequest)
}

export async function fetchRatings ({ assetId, targetId, transactionId, label }) {
  return fetchRatingsHelper({ assetId, targetId, transactionId, label }, fetchRatingsRequest)
}

// helper to fetch ratings
// accepts `assetId` or `transactionId` as array by convenience
// but loops on their values because Stelace API accepts only single filter value
async function fetchRatingsHelper (params, fetchRequest) {
  const clonedParams = { ...params }

  const { assetId, transactionId } = clonedParams

  if (assetId && transactionId) throw new Error('Cannot provide both assetId and transactionId')

  let filterValues = []
  let filter

  if (assetId) {
    filter = 'assetId'
    if (Array.isArray(assetId)) filterValues = assetId
    else filterValues = [assetId]
  } else if (transactionId) {
    filter = 'transactionId'
    if (Array.isArray(transactionId)) filterValues = transactionId
    else filterValues = [transactionId]
  }

  const arrayFilters = ['authorId', 'targetId', 'assetId', 'transactionId']
  const hasEmptyArrayFilter = arrayFilters.some(filter => {
    return Array.isArray(clonedParams[filter]) && isEmpty(clonedParams[filter])
  })

  // do not perform the request
  if (hasEmptyArrayFilter) return []

  if (filter) {
    delete clonedParams.assetId
    delete clonedParams.transactionId

    const ratingsStatsByFilterValue = await p.map(filterValues, filterValue => {
      return fetchAllResults(fetchRequest, {
        ...clonedParams,
        [filter]: filterValue,
      })
    }, { concurrency: 10 })

    return ratingsStatsByFilterValue.reduce((allStats, stats) => allStats.concat(stats), [])
  } else {
    return fetchAllResults(fetchRequest, clonedParams)
  }
}
