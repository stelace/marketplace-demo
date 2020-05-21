const jsonHeaders = {
  'content-type': 'application/json'
}

export function sendJSON (callback, body, statusCode = 200) {
  callback(null, {
    statusCode,
    body: JSON.stringify(body),
    headers: jsonHeaders
  })
}

export function sendError (callback, err) {
  callback(null, {
    statusCode: err.statusCode || 500,
    body: JSON.stringify(err),
    headers: jsonHeaders
  })
}
