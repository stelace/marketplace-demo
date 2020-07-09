import { deburr, isString } from 'lodash'

const regexOperatorsRegex = /[|\\{}()[\]^$+*?.-]/g
const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/

export function escapeRegexp (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replace(regexOperatorsRegex, '\\$&')
}

// Options object format expected by url-safe-string
export function makeSafeForUrl (string, options) {
  /*
    Using deburr to keep basic letters without their accents rather than totally getting rid of them.
    Turns (French) 'Conditions Générales' into 'conditions-generales', much better than 'conditions-gnrales'
    deburr is very limited though and does not turn 'ü' into 'ue' as expected in German, just 'u'.
    Unfortunately String.prototype.normalize is not included in babel
  */
  return safePath(deburr(string))
}

function safePath (str) {
  const opts = {
    maxLength: 100,
    regexRemovePattern: /((?!([a-z0-9-])).)/gi, // matches opposite of [a-z0-9-]
    joinString: '-'
  }

  let path = str.replace(/\s/g, opts.joinString).toLowerCase()

  // Replace anything unsafe but ignore the join string
  path = path.replace(opts.regexRemovePattern, function (match) {
    if (match === opts.joinString) return match
    return ''
  })

  if (path.length > opts.maxLength) path = path.substring(0, opts.maxLength)

  // Remove any duplicates of the join string
  const duplicateJoinRegex = new RegExp(`${opts.joinString}+`, 'g')
  path = path.replace(duplicateJoinRegex, opts.joinString)

  return path
}

export function isEmail (value) {
  return isString(value) && emailRegex.test(value)
}
