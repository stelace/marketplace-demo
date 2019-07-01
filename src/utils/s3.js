import axios from 'axios'
import { get } from 'lodash'

const publicKey = process.env.STELACE_PUBLISHABLE_API_KEY

// Ensures we use an appropriate file 'path' prefix when uploading to S3
export function cleanPrefix (prefix = '') {
  return prefix
    .replace(/\/{2,}/g, '/')
    .replace(/^\//, '')
    .replace(/([^/]+)(\/)?$/, '$1/') // force trailing slash only if string is not empty
}

/**
 * @param  {String} file - Filename
 * @param  {Object} [options]
 * @param  {Object} [options.folder] - For easier maintenance add S3 "folder" prefix (without leading /)
 */
export function getS3SignedUrl (file, { folder = 'files' } = {}) {
  return axios.get( // get AWS S3 signed URL from Lambda behind API Getaway
    `${process.env.VUE_APP_CDN_POLICY_ENDPOINT}?filename=${
      file.name
    }&folder=${
      cleanPrefix(process.env.VUE_APP_CDN_UPLOAD_PREFIX)
    }${folder}`,
    {
      headers: { 'x-api-key': publicKey },
    }
  )
    .then(({ data: S3Sign }) => {
      const fields = Object.keys(S3Sign.params).map(name => ({ name, value: S3Sign.params[name] }))
      fields.push({ name: 'content-type', value: file.type })

      const baseUrl = S3Sign.endpoint_url

      const path = get(fields.find(obj => obj.name === 'key'), 'value')
      if (!path) throw new Error('Could not get signed upload path from S3')

      const S3FileUrl = `${baseUrl}/${path}`

      return {
        S3FileUrl,
        fields,
        url: baseUrl,
        fieldName: 'file' // S3 POST: https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPOST.html
      }
    })
}
