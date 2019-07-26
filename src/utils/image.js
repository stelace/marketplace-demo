const base = process.env.VUE_APP_CDN_S3_URL

/**
 * @param {String} uri - File path such as images/example.png or full URL (like S3 object)
 *
 * @returns {String} Generated CDN image URL
 */
export function getImageUrl (uri = '') {
  let path

  try {
    const url = new URL(uri)
    path = url.pathname
  } catch (e) { // filename URI is an invalid URL
    path = uri
  }

  return `${
    base.replace(/\/$/, '') || ''
  }/${
    path.replace(/^\//, '')
  }`
}

/**
 * Returns true if supported by browser
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
