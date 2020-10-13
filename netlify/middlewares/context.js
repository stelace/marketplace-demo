import { loadNetlifyEnv } from '../utils/env'
import { getWebsiteUrl } from '../../src/utils/url'

loadNetlifyEnv()

export default function addToContext () {
  return {
    before: ({ context }, next) => {
      context.urls = {
        websiteUrl: getWebsiteUrl()
      }
      context.isEcommerceMarketplace = process.env.VUE_APP_MARKETPLACE_TYPE === 'ecommerce'
      context.orderFeeTypes = (process.env.VUE_APP_ORDER_FEE_TYPES || '').split(',')
      next()
    }
  }
}
