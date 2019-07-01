import * as mutationTypes from 'src/store/mutation-types'

export default {
  methods: {
    openValidationDialog ({ formType }) {
      this.$store.commit(mutationTypes.TOGGLE_VALIDATION_DIALOG, { visible: true, formType })
    },
    closeValidationDialog ({ formType }) {
      this.$store.commit(mutationTypes.TOGGLE_VALIDATION_DIALOG, { visible: false, formType })
    }
  }
}
