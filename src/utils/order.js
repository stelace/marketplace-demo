import { get } from 'lodash'

export function populateOrder ({
  order,
  transactionsById,
} = {}) {
  const newOrder = Object.assign({}, order)

  newOrder.lines = (newOrder.lines || []).map(l => {
    const transactionId = get(l, 'metadata.transactionId')

    return {
      ...l,
      transaction: transactionId ? transactionsById[transactionId] : null,
    }
  })
  return newOrder
}
