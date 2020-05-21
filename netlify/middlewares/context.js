import { loadNetlifyEnv } from '../utils/env'
import { getWebsiteUrl } from '../../src/utils/url'

loadNetlifyEnv()

export default function addToContext () {
  return {
    before: ({ context }, next) => {
      context.urls = {
        websiteUrl: getWebsiteUrl()
      }
      next()
    }
  }
}
