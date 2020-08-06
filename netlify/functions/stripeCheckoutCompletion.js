import createError from 'http-errors'
import { get, uniq } from 'lodash'
import { getHandler } from '../utils/handler'
import { loadSdks } from '../utils/sdk'
import { sendJSON, sendError } from '../utils/http'
import Joi from '@hapi/joi'
import pMap from 'p-map'

const schema = {
  body: Joi.object().keys({
    paymentIntentId: Joi.string().required()
  }).required()
}

if (!process.env.STELACE_INSTANT_WEBSITE_URL) {
  throw new Error('Missing Stelace instant website URL')
}

const { stelace, stripe } = loadSdks({ stripe: true })

const stripeCheckoutCompletion = async (event, context, callback) => {
  const { paymentIntentId } = event.body

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (!paymentIntent) throw createError(404)

    const orderId = get(paymentIntent, 'metadata.orderId')
    if (!orderId) throw createError(422, 'Missing orderId')

    const order = await stelace.orders.read(orderId)

    const receiverId = order.lines.reduce((receiverId, l) => {
      if (receiverId) return receiverId
      return l.receiverId || receiverId
    }, null)

    if (!receiverId) throw createError(422, 'Missing order receiverId')

    let topicId
    let transitionName
    if (context.isEcommerceMarketplace) {
      topicId = orderId
      transitionName = 'pay'
    } else {
      const transactionLine = order.lines.find(l => get(l, 'metadata.transactionId'))
      topicId = transactionLine.metadata.transactionId
      transitionName = 'confirmAndPay'
    }

    // remove message hidden attribute so both parties can see it in inbox
    const messages = await stelace.messages.list({ topicId })

    const hiddenMessage = messages.find(message => message.metadata.isHiddenMessage)
    if (hiddenMessage) {
      await stelace.messages.update(hiddenMessage.id, {
        metadata: {
          isHiddenMessage: false
        }
      })

      const sendSignalTo = (userId) => {
        return stelace.forward.post('/signal', {
          message: { id: hiddenMessage.id },
          destination: hiddenMessage.receiverId,
          event: 'newMessage'
        })
      }

      // send signal to both sender and receiver for message update
      // (contrary to signal for message creation in workflows)
      // when the updated message is propagated to client-side
      // inbox will display the conversation in the list thanks to `isHiddenMessage` is false
      await Promise.all([
        sendSignalTo(hiddenMessage.receiverId),
        sendSignalTo(hiddenMessage.senderId),
      ])
    }

    const transactionIds = uniq(order.lines.reduce((ids, l) => {
      const transactionId = get(l, 'metadata.transactionId')
      if (transactionId) return ids.concat([transactionId])
      else return ids
    }, []))

    await pMap(transactionIds, transactionId => {
      return stelace.transactions.createTransition(transactionId, { name: transitionName })
    }, { concurrency: 5 })

    await stelace.orderMoves.create({
      orderId: order.id,
      payerId: order.payerId,
      payerAmount: order.amountDue,
      currency: order.currency,
    })

    sendJSON(callback, { success: true })
  } catch (err) {
    sendError(callback, err)
  }
}

export const handler = getHandler(stripeCheckoutCompletion, { schema, allow: 'POST' })
