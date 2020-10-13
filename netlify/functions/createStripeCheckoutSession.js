import createError from 'http-errors'
import { get } from 'lodash'
import { getHandler } from '../utils/handler'
import { loadSdks } from '../utils/sdk'
import { isAuthenticated, isUser } from '../utils/auth'
import { sendJSON, sendError } from '../utils/http'
import { getCurrencyDecimal } from '../utils/currency'
import Joi from '@hapi/joi'

const schema = {
  body: Joi.object().keys({
    orderId: Joi.string().required()
  }).required()
}

if (!process.env.STELACE_INSTANT_WEBSITE_URL) {
  throw new Error('Missing Stelace instant website URL')
}

const { stelace, stripe } = loadSdks({ stripe: true })

const createStripeCheckoutSession = async (event, context, callback) => {
  const { orderId } = event.body

  try {
    if (!isAuthenticated(context)) throw createError(403)

    const order = await stelace.orders.read(orderId)

    const { payerId, lines } = order

    const ownerId = lines.reduce((ownerId, l) => {
      if (ownerId) return ownerId
      return l.receiverId || ownerId
    }, null)

    if (!ownerId) throw createError(422, 'Missing owner for this order')
    if (!payerId) throw createError(422, 'Missing payer for this order')
    if (!isUser(context, payerId)) throw createError(403)

    const [
      payer,
      owner
    ] = await Promise.all([
      stelace.users.read(payerId),
      stelace.users.read(ownerId)
    ])

    const stripeCustomer = get(payer, 'platformData._private.stripeCustomer')
    const ownerStripeAccount = get(owner, 'platformData._private.stripeAccount')

    if (!ownerStripeAccount) throw createError(422, 'Owner has not linked their Stripe account')

    const websiteUrl = context.urls.websiteUrl

    // most of currencies work with 2 decimals
    let currencyDecimal = 2
    try {
      currencyDecimal = getCurrencyDecimal(order.currency)
    } catch (err) {
      // do nothing
    }

    const platformAmount = lines.reduce((platformAmount, l) => {
      return platformAmount + (l.platformAmount || 0)
    }, 0)

    // round the below amounts because of JS decimal precision (149.7 * 100 !== 14970)
    const applicationFeeAmount = Math.round(platformAmount * Math.pow(10, currencyDecimal))

    let successUrl
    let cancelUrl
    const paymentIntentDataMetadata = { orderId }

    if (context.isEcommerceMarketplace) {
      successUrl = `${websiteUrl}?payment-success=true&orderId=${orderId}`
      cancelUrl = `${websiteUrl}?payment-cancel=true`
    } else {
      const transactionLine = order.lines.find(l => get(l, 'metadata.transactionId'))
      const transactionId = transactionLine.metadata.transactionId

      const transaction = await stelace.transactions.read(transactionId)
      if (!transaction) throw createError(422, 'Missing transaction for this order')

      const assetId = transaction.assetId

      successUrl = `${websiteUrl}/a/${assetId}?payment-success=true&transactionId=${transactionId}`
      cancelUrl = `${websiteUrl}/a/${assetId}?payment-cancel=true`
      paymentIntentDataMetadata.transactionId = transactionId
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      client_reference_id: payer.id,
      customer: stripeCustomer.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
      line_items: [
        {
          name: ' ', // name is required even we don't want to display it
          amount: Math.round(order.amountDue * Math.pow(10, currencyDecimal)),
          currency: order.currency,
          quantity: 1
        },
      ],
      payment_intent_data: {
        setup_future_usage: 'off_session',
        metadata: paymentIntentDataMetadata,
        application_fee_amount: applicationFeeAmount || undefined, // application fee cannot be 0
        transfer_data: {
          destination: owner.platformData._private.stripeAccount.id
        }
      }
    })

    await stelace.orders.update(orderId, {
      platformData: {
        stripePaymentIntentId: checkoutSession.payment_intent,
        currencyDecimal // will be used in workflows
      }
    })

    sendJSON(callback, { id: checkoutSession.id })
  } catch (err) {
    sendError(callback, err)
  }
}

export const handler = getHandler(createStripeCheckoutSession, { schema, allow: 'POST' })
