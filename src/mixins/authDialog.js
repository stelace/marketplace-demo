import * as mutationTypes from 'src/store/mutation-types'

export default {
  methods: {
    openAuthDialog ({ persistent = false, formType, redirectAfterSignup = false, action } = {}) {
      if (formType) {
        this.$store.commit({
          type: mutationTypes.SET_AUTH_DIALOG_FORM_TYPE,
          formType
        })
      }
      if (action) {
        this.$store.commit({
          type: mutationTypes.SET_AUTH_DIALOG_ACTION,
          action
        })
      }

      this.$store.commit(mutationTypes.TOGGLE_AUTH_DIALOG, { visible: true, persistent })
      this.$store.commit(mutationTypes.SET_AUTH_DIALOG_REDIRECTION_AFTER_SIGNUP, { redirectAfterSignup })
    },
    closeAuthDialog () {
      this.$store.commit(mutationTypes.TOGGLE_AUTH_DIALOG, { visible: false, persistent: false })
    }
  }
}
