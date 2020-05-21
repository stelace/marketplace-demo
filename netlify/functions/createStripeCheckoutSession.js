import createError from 'http-errors'
import { get } from 'lodash'
import { getHandler } from '../utils/handler'
import { loadSdks } from '../utils/sdk'
import { isAuthenticated, isUser } from '../utils/auth'
import { sendJSON, sendError } from '../utils/http'
import { loadNetlifyEnv } from '../utils/env'
import { getCurrencyDecimal } from '../utils/currency'
import Joi from '@hapi/joi'

const schema = {
  body: Joi.object().keys({
    transactionId: Joi.string().required()
  }).required()
}

loadNetlifyEnv()

if (!process.env.STELACE_INSTANT_WEBSITE_URL) {
  throw new Error('Missing Stelace instant website URL')
}

const { stelace, stripe } = loadSdks({ stripe: true })

const createStripeCheckoutSession = async (event, context, callback) => {
  const { transactionId } = event.body

  try {
    if (!isAuthenticated(context)) throw createError(403)

    const transaction = await stelace.transactions.read(transactionId)

    const { assetId, takerId, ownerId } = transaction

    if (!assetId) throw createError(422, 'Missing asset for this transaction')
    if (!takerId) throw createError(422, 'Missing taker for this transaction')
    if (!ownerId) throw createError(422, 'Missing owner for this transaction')
    if (!isUser(context, takerId)) throw createError(403)

    const [
      asset,
      taker,
      owner
    ] = await Promise.all([
      stelace.assets.read(assetId),
      stelace.users.read(takerId),
      stelace.users.read(ownerId)
    ])

    const stripeCustomer = get(taker, 'platformData._private.stripeCustomer')
    const ownerStripeAccount = get(owner, 'platformData._private.stripeAccount')

    if (!ownerStripeAccount) throw createError(422, 'Owner has not linked their Stripe account')

    const websiteUrl = process.env.DEPLOY_PRIME_URL || process.env.STELACE_INSTANT_WEBSITE_URL

    // most of currencies work with 2 decimals
    let currencyDecimal = 2
    try {
      currencyDecimal = getCurrencyDecimal(transaction.currency)
    } catch (err) {
      // do nothing
    }

    const applicationFeeAmount = transaction.platformAmount * Math.pow(10, currencyDecimal)

    const checkoutSession = await stripe.checkout.sessions.create({
      client_reference_id: taker.id,
      customer: stripeCustomer.id,
      success_url: `${websiteUrl}/a/${assetId}?payment-success=true&transactionId=${transactionId}`,
      cancel_url: `${websiteUrl}/a/${assetId}?payment-cancel=true`,
      payment_method_types: ['card'],
      line_items: [
        {
          name: asset.name,
          description: asset.description,
          amount: transaction.takerAmount * Math.pow(10, currencyDecimal),
          currency: transaction.currency,
          quantity: 1
        },
      ],
      payment_intent_data: {
        setup_future_usage: 'off_session',
        metadata: {
          transactionId: transactionId
        },
        application_fee_amount: applicationFeeAmount || undefined, // application fee cannot be 0
        capture_method: 'manual',
        transfer_data: {
          destination: owner.platformData._private.stripeAccount.id
        }
      }
    })

    await stelace.transactions.update(transactionId, {
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
