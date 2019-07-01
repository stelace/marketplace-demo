/**
 * @param {String} uri - File path such as images/example.png or full URL (like S3 object)
 *
 * @returns {String} Generated Thumbor server image URL
 */
export function getImageUrl (uri = '') {
  const builder = getBuilder()
  let path

  try {
    const url = new URL(uri)
    path = url.pathname
  } catch (e) { // filename URI is an invalid URL
    path = uri
  }

  return builder.setImagePath(path)
}

// https://thumbor.readthedocs.io/
// Mostly adapted from https://github.com/PolicyMic/thumbor without server-side specifics (HMAC)
// under MIT license.
// Added fit-in modifiers.
// Can be turned into a standalone public repo once switch is fully made to ES6,
// as a client-side-focused package.

/**
 * URL builder with sizing and filter chainable methods like .fitIn(width, height).filter('quality(80)')
 * Note that file path is left untouched when Thumbor server URL is not specified.
 * @param {String} thumborServerUrl
 * @param {Object} params
 * @param {Boolean} [params.acceptEmpty=false] - If true, does not throw when given an empty path
 * @param {Boolean} [params.placeholder=''] - Allowing to build URL when path is missing and acceptEmpty is true
 */
function Thumbor (thumborServerUrl, { acceptEmpty, placeholder }) {
  this.THUMBOR_URL_SERVER = thumborServerUrl.replace(/([^/]+)(\/)?$/, '$1/')
  // force trailing slash only if string is not empty

  this.imagePath = ''
  this.width = 0
  this.height = 0
  this.smart = false
  this.fitInFlag = false
  this.fitInModifier = ''
  this.withFlipHorizontally = false
  this.withFlipVertically = false
  this.halignValue = null
  this.valignValue = null
  this.cropValues = null
  this.meta = false
  this.filtersCalls = []

  this.acceptEmpty = acceptEmpty
  this.placeholder = placeholder
}

Thumbor.prototype = {

  TOP: 'top',
  MIDDLE: 'middle',
  BOTTOM: 'bottom',

  RIGHT: 'right',
  CENTER: 'center',
  LEFT: 'left',

  /**
   * Set path of image
   * @param {String} imagePath [description]
   */
  setImagePath (imagePath) {
    this.imagePath = (imagePath.charAt(0) === '/')
      ? imagePath.substring(1, imagePath.length) : imagePath
    this.imagePath = this.imagePath || this.placeholder
    return this
  },
  /**
   * Converts operation array to string
   * @return {String}
   */
  getOperationPath () {
    const parts = this.urlParts()

    if (parts.length === 0) return ''

    return `${parts.join('/')}/`
  },
  /**
   * Build operation array
   *
   * Could be refactored so that strings are generated in the
   * commands as opposed to in 1 massive function
   *
   * @return {Array}
   */
  urlParts () {
    if (!this.imagePath && !this.acceptEmpty) {
      throw new Error('The image url can\'t be null or empty.')
    }

    const parts = []

    if (this.meta) parts.push('meta')

    if (this.cropValues) {
      parts.push(
        this.cropValues.left +
        'x' + this.cropValues.top +
        ':' + this.cropValues.right +
        'x' + this.cropValues.bottom
      )
    }

    if (this.fitInFlag) parts.push(`${this.fitInModifier ? this.fitInModifier + '-' : ''}fit-in`)

    if (
      this.width ||
      this.height ||
      this.withFlipHorizontally ||
      this.withFlipVertically
    ) {
      let sizeString = ''

      if (this.withFlipHorizontally) sizeString += '-'

      sizeString += Math.round(this.width) // server can crash with float

      sizeString += 'x'

      if (this.withFlipVertically) sizeString += '-'

      sizeString += Math.round(this.height) // same

      parts.push(sizeString)
    }

    if (this.halignValue) parts.push(this.halignValue)

    if (this.valignValue) parts.push(this.valignValue)

    if (this.smart) parts.push('smart')

    if (this.filtersCalls.length) parts.push('filters:' + this.filtersCalls.join(':'))

    return parts
  },
  /**
   * Resize the image to the specified dimensions. Overrides any previous call
   * to `fitIn` or `resize`.
   *
   * Use a value of 0 for proportional resizing. E.g. for a 640 x 480 image,
   * `.resize(320, 0)` yields a 320 x 240 thumbnail.
   *
   * Use a value of 'orig' to use an original image dimension. E.g. for a 640
   * x 480 image, `.resize(320, 'orig')` yields a 320 x 480 thumbnail.
   * @param  {String} width
   * @param  {String} height
   */
  resize (width, height) {
    this.width = width
    this.height = height
    this.fitInFlag = false
    return this
  },

  smartCrop (smartCrop) {
    this.smart = smartCrop
    return this
  },
  /**
   * Resize the image to fit in a box of the specified dimensions.
   * Equivalent to CSS `background-size: contain`
   * Overrides any previous call to `fitIn` or `resize`.
   *
   * `adaptative` modifier equivalent to plain `fit-in`
   * But optimizing for both viewbox portrait or landscape mode, with highest pixel count output
   * E.g. 800x400 pixels given a 100x400 target (portrait) will be resized to 200x100 instead of 100x50
   * Since the user can switch to landscape mode with 400x100 target, so we can have 100px height
   * https://github.com/thumbor/thumbor/pull/67
   *
   *
   * `full` modifier equivalent to CSS `background-size: cover`
   * `adaptative-full` is a compromise and can be considered a minimal cover: 800x400 source
   *     for 100x400 target gives 400x200 instead of 200x100 for plain `adaptative`
   *     and 800x400 for `full`
   * https://github.com/thumbor/thumbor/pull/322
   *
   *
   *
   *
   * @param  {String} width
   * @param  {String} height
   * @param  {String} [fitInModifier='']
   */
  fitIn (width, height, fitInModifier = '') {
    const modifiers = ['adaptative', 'full', 'adaptative-full']
    if (fitInModifier && !modifiers.includes(fitInModifier)) {
      throw new Error(`Expects one of "${modifiers.join('|')}" fit-in modifiers`)
    }
    this.width = width
    this.height = height
    this.fitInFlag = true
    this.fitInModifier = fitInModifier
    return this
  },
  /**
   * Flip image horizontally
   */
  flipHorizontally () {
    this.withFlipHorizontally = true
    return this
  },
  /**
   * Flip image vertically
   */
  flipVertically () {
    this.withFlipVertically = true
    return this
  },
  /**
   * Specify horizontal alignment used if width is altered due to cropping
   * @param  {String} halign 'left', 'center', 'right'
   */
  halign (halign) {
    if (
      halign === this.LEFT ||
      halign === this.RIGHT ||
      halign === this.CENTER
    ) {
      this.halignValue = halign
    } else {
      throw new Error('Horizontal align must be left, right or center.')
    }
    return this
  },
  /**
   * Specify vertical alignment used if height is altered due to cropping
   * @param  {String} valign 'top', 'middle', 'bottom'
   */
  valign (valign) {
    if (
      valign === this.TOP ||
      valign === this.BOTTOM ||
      valign === this.MIDDLE
    ) {
      this.valignValue = valign
    } else {
      throw new Error('Vertical align must be top, bottom or middle.')
    }
    return this
  },
  /**
   * Specify that JSON metadata should be returned instead of the thumbnailed image.
   * @param  {Boolean} metaDataOnly [description]
   */
  metaDataOnly (metaDataOnly) {
    this.meta = metaDataOnly
    return this
  },
  /**
   * Append a filter, e.g. 'quality(80)' or 'format(webp)'
   * https://thumbor.readthedocs.io/en/latest/filters.html
   * @param  {String} filterCall - Skipped if empty
   */
  filter (filterCall) {
    if (typeof filterCall === 'string' && filterCall) this.filtersCalls.push(filterCall)
    return this
  },
  /**
   * Manually specify crop window.
   * @param  {Integer} left
   * @param  {Integer} top
   * @param  {Integer} right
   * @param  {Integer} bottom
   * @return {[type]}
   */
  crop (left, top, right, bottom) {
    this.cropValues = {
      left: left,
      top: top,
      right: right,
      bottom: bottom
    }

    return this
  },
  /**
   * Combine image url and operations
   * @return {String}
   */
  buildUrl () {
    const operation = this.getOperationPath()

    return `${this.THUMBOR_URL_SERVER ? (this.THUMBOR_URL_SERVER + operation) : ''}${this.imagePath}`
  }
}

/**
 * Returns true if supported by browser,
 * so you can use 'format(webp)' Thumbor filter for smaller images
 * @return {Promise<boolean>}
 */
export async function testWebP () {
  return new Promise(resolve => {
    const webP = new Image()
    // Plain WepP inspired from Modernizr test. Not testing alpha, lossless or animated
    webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
    webP.onload = webP.onerror = function () {
      resolve(webP.width === 1)
    }
  })
}

function getBuilder () {
  return new Thumbor(process.env.VUE_APP_CDN_WITH_IMAGE_HANDLER_URL, {
    acceptEmpty: true,
    placeholder: ''
  })
}
