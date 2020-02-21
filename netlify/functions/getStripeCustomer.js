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
    userId: Joi.string().required()
  }).required()
}

if (!process.env.STELACE_SECRET_API_KEY) {
  throw new Error('Missing Stelace secret API key')
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret API key')
}

const stelace = initStelaceSdk({
  apiKey: process.env.STELACE_SECRET_API_KEY,
  apiBaseURL: process.env.STELACE_API_URL
})
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const getStripeCustomer = async (event, context, callback) => {
  const { httpMethod } = event
  const { userId } = event.body

  if (httpMethod === 'OPTIONS') return callback(null, { statusCode: 204 })

  try {
    if (!context.auth || !context.auth.valid || get(context, 'auth.user.userId') !== userId) {
      throw createError(403)
    }

    let user = await stelace.users.read(userId)

    const existingStripeCustomer = get(user, 'platformData._private.stripeCustomer')

    let stripeCustomer

    if (existingStripeCustomer) {
      stripeCustomer = await stripe.customers.update(existingStripeCustomer.id, {
        name: user.displayName || '',
        email: user.email || ''
      })
    } else {
      stripeCustomer = await stripe.customers.create({
        name: user.displayName || '',
        email: user.email || ''
      })

      user = await stelace.users.update(userId, {
        platformData: {
          _private: {
            stripeCustomer
          }
        }
      })
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(stripeCustomer),
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

export const handler = middy(getStripeCustomer)
  .use(jsonBodyParser())
  .use(allowHttpMethods(['POST', 'OPTIONS']))
  .use(validator(schema))
  .use(identifyUser())
  .use(httpErrorHandler())
  .use(cors({ headers: stelaceHeaders }))
