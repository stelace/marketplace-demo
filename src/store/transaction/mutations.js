import { isUndefined } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.SET_TRANSACTION_OPTIONS] (state, { startDate, endDate, quantity }) {
    if (!isUndefined(startDate)) state.startDate = startDate
    if (!isUndefined(endDate)) state.endDate = endDate
    if (!isUndefined(quantity)) state.quantity = quantity
  },

  [types.SET_TRANSACTION_PREVIEW] (state, { preview }) {
    state.preview = preview
  }
}
