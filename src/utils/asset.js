import { get } from 'lodash'
import bounds from 'binary-search-bounds'

export function populateAsset ({ asset, usersById, categoriesById, assetTypesById }) {
  const newAsset = Object.assign({}, asset)
  newAsset.owner = usersById[asset.ownerId]
  newAsset.category = categoriesById[asset.categoryId]
  newAsset.assetType = assetTypesById[asset.assetTypeId]

  newAsset.categoryName = get(newAsset, 'category.name')

  newAsset.locationName = get(newAsset, 'locations[0].shortDisplayName')

  newAsset.timeUnit = get(newAsset, 'assetType.timing.timeUnit', '')

  newAsset.ownerLink = { name: 'publicProfile', params: { id: newAsset.ownerId } }

  return newAsset
}

export function isAvailable ({ asset, availabilityGraphByAssetId }) {
  if (!asset || !asset.id) return false

  const now = new Date().toISOString()
  const minQuantityToBeAvailable = 1

  const assetGraph = availabilityGraphByAssetId[asset.id]
  if (!assetGraph || !assetGraph.graphDates.length) return asset.quantity >= minQuantityToBeAvailable

  const futureGraphDates = assetGraph.graphDates.filter(graphDate => graphDate.date >= now)

  return !!futureGraphDates.find(graphDate => {
    return getRemainingQuantity(graphDate) >= minQuantityToBeAvailable
  })
}

export function getAvailableQuantityByDate ({ availabilityGraph, date }) {
  if (!availabilityGraph) return 0

  const { defaultQuantity, graphDates } = availabilityGraph
  if (!graphDates.length) return defaultQuantity

  // convert graph dates into numeric values
  // numeric values are needed to perform binary search
  const timestamps = graphDates.map(graphDate => getTimestamp(graphDate.date))

  // get the graph date to be the closest inferior or equals to the provided date
  // this graph date will define the available quantity for the date
  const lowerBoundsIndex = bounds.le(timestamps, getTimestamp(date))
  const isBeforeFirstGraphDate = lowerBoundsIndex === -1

  if (isBeforeFirstGraphDate) return defaultQuantity
  else return getRemainingQuantity(graphDates[lowerBoundsIndex])
}

export function getAvailableQuantityByDatesRange ({ availabilityGraph, startDate, endDate }) {
  const incorrectDatesRange = endDate < startDate
  if (!availabilityGraph || incorrectDatesRange) return 0

  const { defaultQuantity, graphDates } = availabilityGraph
  if (!graphDates.length) return defaultQuantity

  // convert graph dates into numeric values
  // numeric values are needed to perform binary search
  const timestamps = graphDates.map(graphDate => getTimestamp(graphDate.date))

  // get the graph date to be the closest inferior or equals to the start/end dates
  const lowerBoundsIndexForStartDate = bounds.le(timestamps, getTimestamp(startDate))
  const lowerBoundsIndexForEndDate = bounds.le(timestamps, getTimestamp(endDate))
  const isStartDateBeforeFirstGraphDate = lowerBoundsIndexForStartDate === -1

  // if start and end dates match the same graph date,
  // then the available quantity is computed based on this graph date
  if (lowerBoundsIndexForStartDate === lowerBoundsIndexForEndDate) {
    if (isStartDateBeforeFirstGraphDate) return defaultQuantity
    else return getRemainingQuantity(graphDates[lowerBoundsIndexForStartDate])
  // otherwise, the available quantity is the minimum available quantity
  // when looping from the start graph date to the end graph date
  } else {
    let remainingQuantity = isStartDateBeforeFirstGraphDate
      ? defaultQuantity
      : getRemainingQuantity(graphDates[lowerBoundsIndexForStartDate])

    for (let i = lowerBoundsIndexForStartDate + 1; i <= lowerBoundsIndexForEndDate; i++) {
      remainingQuantity = Math.min(remainingQuantity, getRemainingQuantity(graphDates[i]))
    }

    return remainingQuantity
  }
}

function getRemainingQuantity (graphDate) {
  return Math.max(graphDate.availableQuantity - graphDate.usedQuantity, 0)
}

function getTimestamp (date) {
  return new Date(date).getTime()
}
