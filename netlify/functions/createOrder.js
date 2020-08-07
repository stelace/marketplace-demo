import createError from 'http-errors'
import { get, keyBy, uniq, isNumber } from 'lodash'
import { getHandler } from '../utils/handler'
import { loadSdks } from '../utils/sdk'
import { isAuthenticated, isUser } from '../utils/auth'
import { sendJSON, sendError } from '../utils/http'
import Joi from '@hapi/joi'

const schema = {
  body: Joi.object().keys({
    transactionIds: Joi.array().items(Joi.string()).min(1).unique().single().required(),
  }).required()
}

const { stelace } = loadSdks()

const createOrder = async (event, context, callback) => {
  const { transactionIds } = event.body

  try {
    if (!isAuthenticated(context)) throw createError(403)

    const transactions = await stelace.transactions.list({
      id: transactionIds
    })

    const transactionsById = keyBy(transactions, 'id')

    const notFoundTransactionIds = transactionIds.filter(id => !transactionsById[id])
    if (notFoundTransactionIds.length) {
      throw createError(404, `Not found transactions: ${notFoundTransactionIds.join(', ')}`)
    }

    const noTakerTransactionIds = transactionIds.filter(id => !isUser(context, transactionsById[id].takerId))
    if (noTakerTransactionIds.length) {
      throw createError(403, `Current user isn't the taker of transactions: ${noTakerTransactionIds.join(', ')}`)
    }

    const noAssetTransactionIds = transactionIds.filter(id => !transactionsById[id].assetId)
    if (noAssetTransactionIds.length) {
      throw createError(422, `No asset for transactions: ${noAssetTransactionIds.join(', ')}`)
    }

    const noTakerAmountTransactionIds = transactionIds.filter(id => !isNumber(transactionsById[id].takerAmount))
    if (noTakerAmountTransactionIds.length) {
      throw createError(422, `No taker amount for transactions: ${noTakerAmountTransactionIds.join(', ')}`)
    }

    const ownerIds = uniq(transactions.map(t => t.ownerId))
    if (ownerIds.length > 1) throw createError(422, 'Multiple owners not allowed')

    const takerId = transactions[0].takerId
    const ownerId = transactions[0].ownerId
    const currency = transactions[0].currency

    const owner = await stelace.users.read(ownerId)

    const lines = transactions.map(transaction => {
      return {
        payerId: takerId,
        payerAmount: transaction.takerAmount,
        receiverId: transaction.ownerId,
        receiverAmount: transaction.takerAmount,
        platformAmount: 0,
        currency,
        metadata: {
          transactionId: transaction.id,
          assetId: transaction.assetId,
        },
      }
    })

    if (context.isEcommerceMarketplace) {
      context.orderFeeTypes.forEach(feeType => {
        const feeAmount = get(owner, `metadata.instant.${feeType}`)

        if (isNumber(feeAmount) && feeAmount > 0) {
          lines.push({
            payerId: takerId,
            payerAmount: feeAmount,
            receiverId: ownerId,
            receiverAmount: feeAmount,
            platformAmount: 0,
            currency,
            metadata: {
              feeType,
            },
          })
        }
      })
    }

    const order = await stelace.orders.create({
      lines,
    })

    sendJSON(callback, order)
  } catch (err) {
    sendError(callback, err)
  }
}

export const handler = getHandler(createOrder, { schema, allow: 'POST' })
