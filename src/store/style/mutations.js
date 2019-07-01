import * as types from 'src/store/mutation-types'

export default {
  [types.SET_STYLE] (state, styles) {
    state = Object.assign({}, state, styles)
  }
}
