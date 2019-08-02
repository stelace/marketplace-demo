/*
 * Prepares CDN image URL with appropriate filters
 * relying on AWS image handler (v4) that leverages sharp
 * https://docs.aws.amazon.com/solutions/latest/serverless-image-handler/deployment.html
*/

/**
 * Class allowing to build CDN image URLs with sharp edit operations,
 * such as resizing or WebP compression.
 */
export class CdnImage {
  /**
   * Instantiates class with CDN parameters.
   * @param {String} base - base URL of CDN handling images, such as https://cdn.stelace.com
   * @param {String} bucket - plain S3 bucket name such as 'my-files'
   * @param {String} [servedFromCdnBucket] - This function lets you check that a file URI
   *   is served from CDN before trying to apply image edits.
   *   This function takes `uri`, `base` and internal `s3BucketUrl` strings as parameters and can return:
   *   -- falsy value: `getUrl(uri, edits)` method will simply return uri and ignore edits.
   *   -- truthy value: `getUrl(uri, edits)` will build the URL with sharp edits.
   *   -- string: used as one-time bucket override in `getUrl` & having the same effect as a truthy value.
   *   Defaults to `(uri, base, bucketUrl) => uri.startsWith(base) || uri.startsWith(bucketUrl)`
   */
  constructor ({ base, bucket, servedFromCdnBucket } = {}) {
    this.base = base
    this.bucket = bucket
    this.s3BucketUrl = `https://${this.bucket}.s3.amazonaws.com`
    this.servedFromCdnBucket = (uri, base = this.base, bucketUrl = this.s3BucketUrl) => {
      if (typeof uri !== 'string') return false
      return typeof servedFromCdnBucket === 'function'
        ? servedFromCdnBucket(uri, base, bucketUrl)
        : (uri.startsWith(base) || uri.startsWith(bucketUrl))
    }
  }

  /**
   * Turn CDN file URI into image URL with edit operations.
   * If `uri` is a full URL and the file is not served from CDN, `uri` is return unchanged.
   * @param {String} uri - File `uri` can be an URL including host and protocol.
   * @param {Object} [edits] - only used if image is served from CDN with image handler.
   *    This object can include any sharp transform, like `edits: { webp: true }`.
   * @param {String} [options.bucket] - overriding default bucket
   *    and bucket returned by `servedFromCdnBucket` method.
   */
  getUrl (uri, edits = {}, options = {}) {
    let path
    const cdnBucket = this.servedFromCdnBucket(uri)

    // aws sharp handler seems to considers mere key presence to enable webp, even with falsy value
    if (Object.keys(edits).includes('webp') && !edits.webp) delete edits.webp

    try {
      const url = new URL(uri)
      path = url.pathname
    } catch (e) {
      if (/valid URL/i.test(e.message)) path = uri // filename URI is an invalid URL
      else return uri
    }

    try {
      if (!cdnBucket) return uri
      const imageRequest = JSON.stringify({
        bucket: options.bucket || (typeof cdnBucket === 'string' ? cdnBucket : this.bucket),
        // URL class automatically encodes path, which we don’t want in this object
        // So we can match key in AWS image handler
        key: decodeURIComponent(path.replace(/^\//, '')),
        edits
      })

      return `${
        this.base.replace(/\/$/, '') || ''
      }/${
        btoa(imageRequest)
      }`
    } catch (e) {
      return uri
    }
  }
}
