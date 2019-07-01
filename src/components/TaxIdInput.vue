<template>
  <QInput
    v-model="taxId"
    class="stl-tax-id-input"
    type="text"
    :loading="loading"
    v-bind="$attrs"
    @input="onTaxIdChange"
  >
    <template
      v-if="isChecked"
      v-slot:append
    >
      <QIcon
        v-if="isValid"
        name="check"
        color="positive"
      />
      <QIcon
        v-else
        name="warning"
        color="negative"
      />
    </template>
  </QInput>
</template>

<script>
import { mapState } from 'vuex'
import { get, isObject } from 'lodash'
import { isValidTaxId } from 'src/utils/user'

import * as mutationTypes from 'src/store/mutation-types'

export default {
  props: {
    initialTaxId: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      taxId: this.initialTaxId,
      validTaxId: false,
      loading: false,
    }
  },
  computed: {
    ...mapState([
      'user',
    ]),
    isValidFormat () {
      return isValidTaxId(this.taxId)
    },
    isValid () {
      if (!this.taxId) return false
      return get(this.user.checkedTaxIds, `${this.taxId}.success`, false)
    },
    isChecked () {
      if (!this.taxId) return false
      return isObject(this.user.checkedTaxIds[this.taxId])
    }
  },
  watch: {
    'user.validationDialog.taxId.step' () {
      const step = this.user.validationDialog.taxId.step

      if (step === 'result') {
        this.afterVerifyingTaxId()
      }
    },
  },
  methods: {
    onTaxIdChange () {
      this.$emit('change', this.taxId)

      if (!this.isValidFormat) return

      if (this.isChecked) {
        if (this.isValid) {
          this.emitValidationResult(this.taxId)
        }
      } else {
        this.verifyTaxId(this.taxId)
      }
    },
    async verifyTaxId (taxId) {
      if (this.isChecked) return

      this.loading = true

      this.$store.commit({
        type: mutationTypes.SET_VALIDATION_DIALOG_DATA,
        formType: 'taxId',
        data: {
          step: null, // set to null for watcher
          taxId: null
        }
      })

      try {
        await this.$store.dispatch('sendCustomEvent', {
          type: 'taxIdValidation_request',
          objectId: this.userId, // automatically populated in event for workflows
          metadata: {
            taxId,
            signalId: this.$socket.signal_id
          }
        })
      } catch (err) {
        this.loading = false
      }
    },
    afterVerifyingTaxId () {
      this.loading = false

      const taxId = this.user.validationDialog.taxId.taxId
      const taxIdResult = this.user.checkedTaxIds[taxId]

      if (taxIdResult.success) {
        this.emitValidationResult(taxId)
      }
    },
    emitValidationResult (taxId) {
      const taxIdResult = this.user.checkedTaxIds[taxId]

      this.$emit('validate', {
        taxId,
        success: taxIdResult.success,
        countryCode: taxIdResult.countryCode,
        companyName: taxIdResult.companyName,
        companyAddress: taxIdResult.companyAddress,
      })
    }
  }
}

</script>

<style lang="stylus" scoped>

</style>
