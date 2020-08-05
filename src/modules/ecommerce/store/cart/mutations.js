import { isUndefined } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.CART__SET_LOCAL_CART] (state, { localCart }) {
    state.localCart = localCart
  },

  [types.CART__SET_PREVIEWED_TRANSACTIONS] (state, { previewedTransactions }) {
    state.previewedTransactions = previewedTransactions
  },

  [types.CART__SET_OWNER] (state, { owner }) {
    state.owner = owner
  },

  [types.CART__SET_PRICES] (state, { deliveryFee, subTotalPrice, totalPrice }) {
    if (!isUndefined(deliveryFee)) state.deliveryFee = deliveryFee
    if (!isUndefined(subTotalPrice)) state.subTotalPrice = subTotalPrice
    if (!isUndefined(totalPrice)) state.totalPrice = totalPrice
  }
}
