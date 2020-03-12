// Original file:
// https://github.com/netlify/netlify-lambda/blob/master/lib/serve.js

// Adapt this file to use `app` exposed by Webpack `.before` option.
// These are the changes that are made:
// - removed `express` package as the object `app` is passed by Webpack dev server
// - replaced the parameter `static` by `isStatic` in the function `createHandler()` as it is a reserved word
// - renamed exported function `.listen()` to `.run()`
// - in the exported function:
//     - adapted the function parameters to work with Webpack dev server
//     - removed all routes/middlewares except from body parser middlewares and route using `createHandler`
//     - removed the returned object
//     - changed the route path from '*' to '/.netlify/functions/*' to match only routes to Netlify functions
//     - passed the default parameters to `createHandler()`
// - fixed ESLint warnings

var bodyParser = require('body-parser')
var queryString = require('querystring')
var path = require('path')
var jwtDecode = require('jwt-decode')
var conf = require('./config')

function handleErr (err, response) {
  response.statusCode = 500
  response.write('Function invocation failed: ' + err.toString())
  response.end()
  console.log('Error during invocation: ', err)
}

function handleInvocationTimeout (response, timeout) {
  response.statusCode = 500
  response.write(`Function invocation took longer than ${timeout} seconds.`)
  response.end()
  console.log(
    `Your lambda function took longer than ${timeout} seconds to finish.
If you need a longer execution time, you can increase the timeout using the -t or --timeout flag.
Please note that default function invocation is 10 seconds, check our documentation for more information (https://www.netlify.com/docs/functions/#custom-deployment-options).
`
  )
}

function createCallback (response) {
  return function callback (err, lambdaResponse) {
    if (err) {
      return handleErr(err, response)
    }

    response.statusCode = lambdaResponse.statusCode
    for (const key in lambdaResponse.headers) {
      response.setHeader(key, lambdaResponse.headers[key])
    }
    for (const key in lambdaResponse.multiValueHeaders) {
      const items = lambdaResponse.multiValueHeaders[key]
      response.setHeader(key, items)
    }

    if (lambdaResponse.body) {
      response.write(
        lambdaResponse.isBase64Encoded
          ? Buffer.from(lambdaResponse.body, 'base64')
          : lambdaResponse.body
      )
    } else {
      if (
        response.statusCode !== 204 &&
        process.env.CONTEXT !== 'production' &&
        !process.env.SILENCE_EMPTY_LAMBDA_WARNING
      ) {
        console.log(
          `Your lambda function didn't return a body, which may be a mistake. Check our Usage docs for examples (https://github.com/netlify/netlify-lambda#usage).
          If this is intentional, you can silence this warning by setting process.env.SILENCE_EMPTY_LAMBDA_WARNING to a truthy value or process.env.CONTEXT to 'production'`
        )
      }
    }
    response.end()
  }
}

function promiseCallback (promise, callback) {
  if (!promise) return
  if (typeof promise.then !== 'function') return
  if (typeof callback !== 'function') return

  return promise.then(
    function (data) {
      callback(null, data)
    },
    function (err) {
      callback(err, null)
    }
  )
}

function buildClientContext (headers) {
  // inject a client context based on auth header https://github.com/netlify/netlify-lambda/pull/57
  if (!headers.authorization) return

  const parts = headers.authorization.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return

  try {
    return {
      identity: {
        url: 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_URL',
        token: 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_TOKEN'
      },
      user: jwtDecode(parts[1])
    }
  } catch (e) {
    // Ignore errors - bearer token is not a JWT, probably not intended for us
  }
}

function createHandler (dir, isStatic, timeout) {
  return function (request, response) {
    // handle proxies without path re-writes (http-servr)
    var cleanPath = request.path.replace(/^\/.netlify\/functions/, '')

    var func = cleanPath.split('/').filter(e => !!e)[0]
    if (typeof func === 'undefined') {
      console.error(
        `Something went wrong and the function path derived from ${cleanPath} (raw form: ${
          request.path
        }) was undefined. Please doublecheck your function naming and toml configuration.`
      )
    }
    if (typeof dir === 'undefined') {
      console.error(
        `Something went wrong and the function directory ${dir} was undefined. Please doublecheck your toml configuration.`
      )
    }
    var module = path.join(process.cwd(), dir, func)
    if (isStatic) {
      delete require.cache[require.resolve(module)]
    }
    var handler
    try {
      handler = require(module)
    } catch (err) {
      handleErr(err, response)
      return
    }

    var isBase64 =
      request.body &&
      !(request.headers['content-type'] || '').match(
        /text|application|multipart\/form-data/
      )
    var lambdaRequest = {
      path: request.path,
      httpMethod: request.method,
      queryStringParameters: queryString.parse(request.url.split(/\?(.+)/)[1]),
      headers: request.headers,
      body: isBase64
        ? Buffer.from(request.body.toString(), 'utf8').toString('base64')
        : request.body,
      isBase64Encoded: isBase64
    }

    var callback = createCallback(response)

    var promise = handler.handler(
      lambdaRequest,
      { clientContext: buildClientContext(request.headers) || {} },
      callback
    )

    var invocationTimeoutRef = null

    Promise.race([
      promiseCallback(promise, callback),
      new Promise(function (resolve) {
        invocationTimeoutRef = setTimeout(function () {
          handleInvocationTimeout(response, timeout)
          resolve()
        }, timeout * 1000)
      })
    ]).then(
      result => {
        clearTimeout(invocationTimeoutRef)
        return result // not used, but writing this to avoid future footguns
      },
      err => {
        clearTimeout(invocationTimeoutRef)
        throw err
      }
    )
  }
}

exports.run = function (app) {
  var config = conf.load()
  var dir = config.build.functions || config.build.Functions

  app.use(bodyParser.raw({ limit: '6mb' }))
  app.use(bodyParser.text({ limit: '6mb', type: '*/*' }))

  var defaultTimeout = 10

  app.all('/.netlify/functions/*', createHandler(dir, false, defaultTimeout))
}
