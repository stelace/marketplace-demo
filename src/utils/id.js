const transactionIdPrefix = 'trn'
const assetIdPrefix = 'ast'

export function isTransactionId (id) {
  return typeof id === 'string' && id.startsWith(transactionIdPrefix)
}

export function isAssetId (id) {
  return typeof id === 'string' && id.startsWith(assetIdPrefix)
}
