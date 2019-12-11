import { get } from 'lodash'
import { convertApiToDisplayScore } from 'src/utils/rating'
import bounds from 'binary-search-bounds'
import getDistance from 'geolib/es/getDistance'

export function populateAsset ({
  asset,
  usersById,
  categoriesById,
  assetTypesById,
  ratingsStatsByAssetId,
  ratingsOptions,
  currentUserPosition,
}) {
  const newAsset = Object.assign({}, asset)
  newAsset.owner = usersById[asset.ownerId]
  newAsset.category = categoriesById[asset.categoryId]
  newAsset.assetType = assetTypesById[asset.assetTypeId]

  newAsset.images = get(newAsset, 'metadata.images')

  newAsset.categoryName = get(newAsset, 'category.name')

  newAsset.locationName = get(newAsset, 'locations[0].shortDisplayName')

  newAsset.timeUnit = get(newAsset, 'assetType.timing.timeUnit', '')

  newAsset.ownerLink = { name: 'publicProfile', params: { id: newAsset.ownerId } }

  if (currentUserPosition && newAsset.locations.length) {
    const assetLocation = newAsset.locations[0]
    newAsset.distance = getDistance(
      { latitude: currentUserPosition.latitude, longitude: currentUserPosition.longitude },
      { latitude: assetLocation.latitude, longitude: assetLocation.longitude },
    )
  }

  if (ratingsStatsByAssetId && ratingsOptions) {
    const defaultAvgScore = get(ratingsStatsByAssetId, `default.${newAsset.id}.avg`, null)

    newAsset.averageRating = convertApiToDisplayScore(
      defaultAvgScore,
      { displayMaxScore: get(ratingsOptions, 'stats.default.maxScore') }
    )
  }

  return newAsset
}

export function isAvailable ({ asset, availabilityGraphByAssetId }) {
  if (!asset || !asset.id) return false

  const now = new Date().toISOString()
  const minQuantityToBeAvailable = 1

  const assetGraph = availabilityGraphByAssetId[asset.id]
  if (!assetGraph) return asset.quantity >= minQuantityToBeAvailable

  const { graphDates, defaultQuantity } = assetGraph

  // convert graph dates into numeric values
  // numeric values are needed to perform binary search
  const timestamps = assetGraph.graphDates.map(graphDate => getTimestamp(graphDate.date))

  // get graph dates whose date is the closest inferior or equals to now
  const lowerBoundsIndex = bounds.le(timestamps, getTimestamp(now))
  const filteredGraphDates = graphDates.slice(lowerBoundsIndex)
  if (!filteredGraphDates.length) return defaultQuantity >= minQuantityToBeAvailable

  // asset is considered to be available if there is remaining quantity
  // for at least one graph date
  return !!filteredGraphDates.find(graphDate => {
    return getRemainingQuantity(graphDate) >= minQuantityToBeAvailable
  })
}

export function getAvailableQuantityByDate ({ availabilityGraph, date, startDate, endDate }) {
  if (date && startDate && endDate) throw new Error('Expected date OR startDate and endDate')

  const isDateRange = startDate && endDate
  const incorrectDatesRange = endDate < startDate

  if (!availabilityGraph) return 0
  if (isDateRange && incorrectDatesRange) return 0

  const { defaultQuantity, graphDates } = availabilityGraph
  if (!graphDates.length) return defaultQuantity || 0

  // convert graph dates into numeric values
  // numeric values are needed to perform binary search
  const timestamps = graphDates.map(graphDate => getTimestamp(graphDate.date))

  const getRemainingQuantityForGraphDates = (index) => {
    const isBeforeFirstGraphDate = index === -1

    if (isBeforeFirstGraphDate) return defaultQuantity || 0
    else return getRemainingQuantity(graphDates[index])
  }

  // get the graph date to be the closest inferior or equals to the provided date
  // this graph date will define the available quantity for the date
  if (!isDateRange) {
    const lowerBoundsIndex = bounds.le(timestamps, getTimestamp(date))
    return getRemainingQuantityForGraphDates(lowerBoundsIndex)
  } else {
    // get the graph date to be the closest inferior or equals to the start/end dates
    const lowerBoundsIndexForStartDate = bounds.le(timestamps, getTimestamp(startDate))
    const lowerBoundsIndexForEndDate = bounds.le(timestamps, getTimestamp(endDate))

    let remainingQuantity = getRemainingQuantityForGraphDates(lowerBoundsIndexForStartDate)

    // if start and end dates match the same graph date,
    // then the available quantity is computed based on this graph date
    if (lowerBoundsIndexForStartDate === lowerBoundsIndexForEndDate) {
      return remainingQuantity
    // otherwise, the available quantity is the minimum available quantity
    // when looping from the start graph date to the end graph date
    } else {
      for (let i = lowerBoundsIndexForStartDate + 1; i <= lowerBoundsIndexForEndDate; i++) {
        remainingQuantity = Math.min(remainingQuantity, getRemainingQuantity(graphDates[i]))
      }

      return remainingQuantity
    }
  }
}

function getRemainingQuantity (graphDate) {
  return Math.max(graphDate.availableQuantity - graphDate.usedQuantity, 0)
}

function getTimestamp (date) {
  return new Date(date).getTime()
}
