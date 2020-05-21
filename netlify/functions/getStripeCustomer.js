import createError from 'http-errors'
import { get } from 'lodash'
import { getHandler } from '../utils/handler'
import { loadSdks } from '../utils/sdk'
import { isUser } from '../utils/auth'
import { sendJSON, sendError } from '../utils/http'
import Joi from '@hapi/joi'

const schema = {
  body: Joi.object().keys({
    userId: Joi.string().required()
  }).required()
}

const { stelace, stripe } = loadSdks({ stripe: true })

const getStripeCustomer = async (event, context, callback) => {
  const { userId } = event.body

  try {
    if (!isUser(context, userId)) throw createError(403)

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

    sendJSON(callback, stripeCustomer)
  } catch (err) {
    sendError(callback, err)
  }
}

export const handler = getHandler(getStripeCustomer, { schema, allow: 'POST' })
