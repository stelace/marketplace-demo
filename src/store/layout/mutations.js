import * as types from 'src/store/mutation-types'

export default {
  [types.LAYOUT__TOGGLE_MENU] (state, { visible }) {
    state.isMenuOpened = typeof visible === 'boolean' ? visible : !state.isMenuOpened
  },
  // Currently handled by each route.meta & router
  [types.LAYOUT__TOGGLE_LEFT_DRAWER] (state, { visible } = {}) {
    state.isLeftDrawerOpened = typeof visible === 'boolean' ? visible : !state.isLeftDrawerOpened
  },

  [types.LAYOUT__SET_PAGE_BLURRED] (state, { blurred }) {
    state.isPageBlurred = blurred
  }
}
