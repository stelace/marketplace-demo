import Joi from '@hapi/joi'

const defaultJoiOptions = {
  convert: true,
  allowUnknown: false,
  abortEarly: false
}

export default function validator (schema, joiOptions) {
  return {
    before: ({ event, callback }, next) => {
      const { httpMethod } = event

      if (httpMethod === 'OPTIONS') return next()
      if (!schema) return next()

      const joiSchema = Joi.object().keys(schema)

      const toValidate = {}
      if (schema.query) toValidate.query = event.queryStringParameters || {}
      if (schema.body) toValidate.body = event.body || {}
      if (schema.headers) toValidate.headers = event.headers || {}

      const { error } = joiSchema.validate(toValidate, Object.assign({}, defaultJoiOptions, joiOptions))

      if (error) {
        callback(null, {
          statusCode: 400,
          body: JSON.stringify({
            details: error.details
          }),
          headers: {
            'content-type': 'application/json'
          }
        })
      } else {
        next()
      }
    }
  }
}
