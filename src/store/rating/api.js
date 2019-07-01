import stelace, { fetchAllResults } from 'src/utils/stelace'

const fetchRatingsStatsRequest = (...args) => stelace.ratings.getStats(...args)

export async function fetchRatingsStatsByType ({ targetId, transactionId, groupBy, ratingsOptions }) {
  const ratingTypes = Object.keys(ratingsOptions.stats)
  const ratingsStatsByType = {}

  for (let i = 0; i < ratingTypes.length; i++) {
    const ratingType = ratingTypes[i]
    const ratingConfig = ratingsOptions.stats[ratingType]

    const fetchRatingsStats = fetchAllResults(fetchRatingsStatsRequest, {
      groupBy,
      targetId,
      transactionId,
      label: ratingConfig.labels.join(',')
    })

    const ratingsStats = await fetchRatingsStats
    ratingsStatsByType[ratingType] = ratingsStats
  }

  return ratingsStatsByType
}

export async function fetchRatingsStats ({ targetId, transactionId, groupBy }) {
  const ratingsStats = await fetchAllResults(fetchRatingsStatsRequest, {
    groupBy,
    targetId,
    transactionId,
  })

  return ratingsStats
}
