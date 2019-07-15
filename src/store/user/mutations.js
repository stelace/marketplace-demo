import * as types from 'src/store/mutation-types'

export default {
  [types.SET_SELECTED_USER] (state, { user }) {
    state.selectedUser = user || {}
  },

  [types.TOGGLE_VALIDATION_DIALOG] (state, { visible, formType }) {
    if (!isAllowedFormTypes(formType)) return

    state.validationDialog[formType].opened = typeof visible === 'boolean' ? visible : !state.validationDialog[formType].opened
  },

  [types.SET_VALIDATION_DIALOG_DATA] (state, { data = {}, formType }) {
    if (!isAllowedFormTypes(formType)) return

    state.validationDialog[formType] = Object.assign({}, state.validationDialog[formType], data)
  },
}

function isAllowedFormTypes (formType) {
  const allowedFormTypes = [
    'email',
  ]
  return allowedFormTypes.includes(formType)
}
