// This file is used to seed Stelace database with data exported below,
// using init-data.js script (`yarn seed`).

const { getWorkflows } = require('../workflows')
const getServiceData = require('./data-service')
const getEcommerceData = require('./data-ecommerce')

// Please ensure you add your own translations if not using 'en' or 'fr'
const locale = process.env.VUE_APP_DEFAULT_LANGUAGE || 'en'
const marketplaceType = process.env.VUE_APP_MARKETPLACE_TYPE

const isEcommerceMarketplace = marketplaceType === 'ecommerce'

let data
if (isEcommerceMarketplace) data = getEcommerceData(locale)
else data = getServiceData(locale)

data.workflows = getWorkflows(locale, marketplaceType)

module.exports = data
