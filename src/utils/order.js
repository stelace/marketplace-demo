import { get, isNumber } from 'lodash'

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

export function getOrderFees (orderFeeTypes, user) {
  const getFeeAmount = feeType => get(user, `metadata.instant.${feeType}`)

  return orderFeeTypes.reduce((orderFees, orderFeeType) => {
    const amount = getFeeAmount(orderFeeType)
    if (isNumber(amount)) {
      return orderFees.concat([{
        feeType: orderFeeType,
        amount,
      }])
    } else {
      return orderFees
    }
  }, [])
}
