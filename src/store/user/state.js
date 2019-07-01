export default {
  selectedUser: {},

  validationDialog: {
    email: {
      opened: false
    },
    phone: {
      opened: false,
      step: null,
      phone: null,
      requestId: null,
    },
    taxId: {
      step: null,
      taxId: null,
    }
  },

  checkedTaxIds: {}
}
