import Vue from 'vue'
import Vuex from 'vuex'

import access from './access'
import asset from './asset'
import auth from './auth'
import cart from '../modules/ecommerce/store/cart'
import content from './content'
import common from './common'
import inbox from './inbox'
import layout from './layout'
import rating from './rating'
import search from './search'
import style from './style'
import transaction from './transaction'
import user from './user'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

const isEcommerceMarketplace = process.env.VUE_APP_MARKETPLACE_TYPE === 'ecommerce'

export default function (/* { ssrContext } */) {
  const modules = {
    access,
    asset,
    auth,
    content,
    common,
    inbox,
    layout,
    rating,
    search,
    style,
    user,
    transaction,
  }

  if (isEcommerceMarketplace) {
    modules.cart = cart
  }

  const Store = new Vuex.Store({
    modules
  })

  return Store
}
