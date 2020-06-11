import createError from 'http-errors'
import { getHandler } from '../utils/handler'
import { loadSdks } from '../utils/sdk'
import { isUser } from '../utils/auth'
import { sendJSON, sendError } from '../utils/http'
import Joi from '@hapi/joi'

const schema = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    code: Joi.string().required()
  }).required()
}

const { stelace, stripe } = loadSdks({ stripe: true })

if (!process.env.VUE_APP_STRIPE_OAUTH_CLIENT_ID) {
  throw new Error('Missing Stripe OAuth client ID')
}

const linkStripeAccount = async (event, context, callback) => {
  const { userId, code } = event.body

  try {
    if (!isUser(context, userId)) throw createError(403)

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

    sendJSON(callback, stripeAccount)
  } catch (err) {
    sendError(callback, err)
  }
}

export const handler = getHandler(linkStripeAccount, { schema, allow: 'POST' })
