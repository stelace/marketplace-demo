import createError from 'http-errors'
import middy from 'middy'
import Stripe from 'stripe'
import { get } from 'lodash'
import { jsonBodyParser, httpErrorHandler, cors } from 'middy/middlewares'
import { allowHttpMethods, identifyUser, validator } from '../middlewares'
import { initStelaceSdk } from '../../src/utils/stelace'
import { stelaceHeaders } from '../utils/cors'
import Joi from '@hapi/joi'

const jsonHeaders = {
  'content-type': 'application/json'
}

const schema = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    code: Joi.string().required()
  }).required()
}

if (!process.env.STELACE_SECRET_API_KEY) {
  throw new Error('Missing Stelace secret API key')
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret API key')
}
if (!process.env.STRIPE_OAUTH_CLIENT_ID) {
  throw new Error('Missing Stripe OAuth client ID')
}

const stelace = initStelaceSdk({
  apiKey: process.env.STELACE_SECRET_API_KEY,
  apiBaseURL: process.env.STELACE_API_URL
})
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const linkStripeAccount = async (event, context, callback) => {
  const { httpMethod } = event
  const { userId, code } = event.body

  if (httpMethod === 'OPTIONS') return callback(null, { statusCode: 204 })

  try {
    if (!context.auth || !context.auth.valid || get(context, 'auth.user.userId') !== userId) {
      throw createError(403)
    }

    const { stripe_user_id: accountId } = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code
    })

    const stripeAccount = await stripe.accounts.retrieve(accountId)

    await stelace.users.update(userId, {
      platformData: {
        _private: {
          stripeAccount
        }
      }
    })

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(stripeAccount),
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

export const handler = middy(linkStripeAccount)
  .use(jsonBodyParser())
  .use(allowHttpMethods(['POST', 'OPTIONS']))
  .use(validator(schema))
  .use(identifyUser())
  .use(httpErrorHandler())
  .use(cors({ headers: stelaceHeaders }))
