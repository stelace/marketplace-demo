import createError from 'http-errors'
import middy from 'middy'
import Stripe from 'stripe'
import { get } from 'lodash'
import { jsonBodyParser, httpErrorHandler, cors } from 'middy/middlewares'
import { allowHttpMethods, identifyUser, validator } from '../middlewares'
import { initStelaceSdk } from '../utils/stelace'
import { stelaceHeaders } from '../utils/cors'
import { loadNetlifyEnv } from '../utils/env'
import { getCurrencyDecimal } from '../utils/currency'
import Joi from '@hapi/joi'

const jsonHeaders = {
  'content-type': 'application/json'
}

const schema = {
  body: Joi.object().keys({
    transactionId: Joi.string().required()
  }).required()
}

loadNetlifyEnv()

if (!process.env.STELACE_SECRET_API_KEY) {
  throw new Error('Missing Stelace secret API key')
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret API key')
}
if (!process.env.STELACE_INSTANT_WEBSITE_URL) {
  throw new Error('Missing Stelace instant website URL')
}

const stelace = initStelaceSdk({
  apiKey: process.env.STELACE_SECRET_API_KEY,
  apiBaseURL: process.env.STELACE_API_URL
})
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const createStripeCheckoutSession = async (event, context, callback) => {
  const { httpMethod } = event
  const { transactionId } = event.body

  if (httpMethod === 'OPTIONS') return callback(null, { statusCode: 204 })

  try {
    if (!context.auth || !context.auth.valid) throw createError(403)

    const transaction = await stelace.transactions.read(transactionId)

    const { assetId, takerId } = transaction

    if (!assetId || !takerId) throw createError(422, 'Cannot create a Stripe checkout for this transaction')

    if (get(context, 'auth.user.userId') !== takerId) throw createError(403)

    const [
      asset,
      taker
    ] = await Promise.all([
      stelace.assets.read(assetId),
      stelace.users.read(takerId)
    ])

    const stripeCustomer = get(taker, 'platformData._private.stripeCustomer')

    const websiteUrl = process.env.DEPLOY_PRIME_URL || process.env.STELACE_INSTANT_WEBSITE_URL

    // most of currencies work with 2 decimals
    let currencyDecimal = 2
    try {
      currencyDecimal = getCurrencyDecimal(transaction.currency)
    } catch (err) {
      // do nothing
    }

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
        }
      }
    })

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ id: checkoutSession.id }),
      headers: jsonHeaders
    })
  } catch (err) {
    callback(null, {
      statusCode: err.statusCode,
      body: JSON.stringify(err),
      headers: jsonHeaders
    })
  }
}

export const handler = middy(createStripeCheckoutSession)
  .use(jsonBodyParser())
  .use(allowHttpMethods(['POST', 'OPTIONS']))
  .use(validator(schema))
  .use(identifyUser())
  .use(httpErrorHandler())
  .use(cors({ headers: stelaceHeaders }))
