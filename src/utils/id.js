const transactionIdPrefix = 'trn'
const assetIdPrefix = 'ast'
const orderIdPrefix = 'ord'

export function isTransactionId (id) {
  return typeof id === 'string' && id.startsWith(transactionIdPrefix)
}

export function isAssetId (id) {
  return typeof id === 'string' && id.startsWith(assetIdPrefix)
}

export function isOrderId (id) {
  return typeof id === 'string' && id.startsWith(orderIdPrefix)
}
