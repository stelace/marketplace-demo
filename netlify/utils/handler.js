import middy from 'middy'
import { jsonBodyParser, httpErrorHandler, cors } from 'middy/middlewares'
import { flatten } from 'lodash'
import { stelaceHeaders } from './cors'
import { allowHttpMethods, identifyUser, validator, addToContext } from '../middlewares'
import { loadNetlifyEnv } from '../utils/env'

loadNetlifyEnv()

/**
 * @param {Function} originalHandler
 * @param {Object}          [options]
 * @param {Object}          [options.schema] - Joi schema for validation
 * @param {String|String[]} [options.allow] - HTTP allowed verbs ('OPTIONS' is automatically added)
 * @param {Boolean}         [options.auth = true] - if true, authentication logic will be performed
 * @param {Function}        newHandler
 */
export function getHandler (originalHandler, { schema, allow, auth = true } = {}) {
  const newHandler = middy(originalHandler)

  const allowedVerbs = flatten([allow, 'OPTIONS'])

  newHandler
    .use(jsonBodyParser())
    .use(allowHttpMethods(allowedVerbs))
    .use(addToContext())

  if (schema) newHandler.use(validator(schema))
  if (auth) newHandler.use(identifyUser())

  newHandler
    .use(httpErrorHandler())
    .use(cors({ headers: stelaceHeaders }))

  return newHandler
}
