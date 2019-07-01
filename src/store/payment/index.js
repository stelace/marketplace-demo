import state from './state'
import * as getters from './getters'
import mutations from './mutations'
import * as actions from './actions'

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions
}
