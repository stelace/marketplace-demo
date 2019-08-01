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
