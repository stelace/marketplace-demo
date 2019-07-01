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

  [types.ADD_CHECKED_TAX_ID] (state, { taxId, taxIdResult }) {
    state.checkedTaxIds = Object.assign({}, state.checkedTaxIds, {
      [taxId]: taxIdResult
    })
  }
}

function isAllowedFormTypes (formType) {
  const allowedFormTypes = [
    'email',
    'phone',
    'taxId'
  ]
  return allowedFormTypes.includes(formType)
}
