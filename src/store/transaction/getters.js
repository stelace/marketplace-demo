import { getAvailableQuantityByDate } from 'src/utils/asset'

export function transactionDatesRequired (state, getters, rootState, rootGetters) {
  const { activeAsset } = rootGetters

  if (!activeAsset || !activeAsset.assetType) return false
  return !!activeAsset.assetType.timeBased
}

export function validTransactionOptions (state, getters, rootState, rootGetters) {
  const { startDate, endDate, quantity } = state
  const { availabilityGraphByAssetId } = rootState.asset
  const { activeAsset, transactionDatesRequired } = rootGetters

  if (!activeAsset || !activeAsset.assetType) return false
  if (!transactionDatesRequired) return true

  const availabilityGraph = availabilityGraphByAssetId[activeAsset.id]
  if (!availabilityGraph) return false

  const now = new Date().toISOString()

  if (transactionDatesRequired) {
    if (!startDate || !endDate) return false
    if (endDate < startDate) return false

    const availableQuantity = getAvailableQuantityByDate({ availabilityGraph, startDate, endDate })
    return availableQuantity >= quantity
  } else {
    const availableQuantity = getAvailableQuantityByDate({ availabilityGraph, date: now })
    return availableQuantity >= quantity
  }
}

export function promptTransactionDates (state, getters, rootState, rootGetters) {
  const { activeAsset } = rootGetters

  if (!activeAsset || !activeAsset.assetType) return false
  return activeAsset.assetType.timeBased
}

export function promptTransactionQuantity (state, getters, rootState, rootGetters) {
  return rootGetters.maxAvailableQuantity > 1
}

export function maxAvailableQuantity (state, getters, rootState, rootGetters) {
  const { startDate, endDate } = state
  const { availabilityGraphByAssetId } = rootState.asset
  const { activeAsset } = rootGetters

  if (!activeAsset || !activeAsset.id) return 0

  const availabilityGraph = availabilityGraphByAssetId[activeAsset.id]
  if (!availabilityGraph) return 0 // provide a fallback in case availability graph isn't available

  const { graphDates, defaultQuantity } = availabilityGraph

  if (promptTransactionDates && startDate && endDate) {
    return getAvailableQuantityByDate({ availabilityGraph, startDate, endDate })
  } else {
    if (!graphDates.length) return defaultQuantity

    let maxQuantity = 0
    graphDates.forEach(graphDate => {
      maxQuantity = Math.max(maxQuantity, getAvailableQuantityByDate({ availabilityGraph, date: graphDate.date }))
    })
    return maxQuantity
  }
}
