<template>
  <ValidationDialog
    ref="phoneValidationDialog"
    :opened="user.validationDialog.phone.opened"
    :nb-steps="3"
    @close="closeDialog"
    @open="initPhone"
  >
    <template v-slot:step1="{ goNext }">
      <q-card-section class="text-center">
        <AppContent
          entry="user"
          field="account.new_phone_number_helper"
          :options="{ phone: selectedUser.phone || undefined }"
        />
      </q-card-section>
      <q-card-section>
        <form @submit.prevent="savePhone({ goNext })">
          <VueTelInput
            v-model="displayPhone"
            :placeholder="$t({ id: 'user.phone_number_label' })"
            required
            disabled-fetching-country
            :default-country="defaultCountry"
            :preferred-countries="preferredCountries"
            @onInput="changePhone"
          />

          <div class="error-message q-mt-sm">
            <AppContent
              v-if="errorType === 'alreadyVerified'"
              entry="notification"
              field="already_validated"
            />
            <AppContent
              v-if="errorType === 'unknown'"
              entry="error"
              field="unknown_happened"
            />
          </div>

          <div class="q-mt-md">
            <q-btn
              color="positive"
              :loading="actionPending"
              type="submit"
              :rounded="style.roundedTheme"
              class="full-width q-my-sm"
              :disabled="savePhoneButtonDisabled"
            >
              <AppContent
                entry="user"
                field="account.phone_validation_button"
              />
            </q-btn>
          </div>
        </form>
      </q-card-section>
    </template>

    <template v-slot:step2="{ goNext }">
      <q-card-section class="text-center">
        <AppContent
          entry="user"
          field="account.phone_validation_code_sent"
        />
      </q-card-section>
      <q-card-section>
        <form @submit.prevent="sendCode({ goNext })">
          <q-input
            v-model="code"
            :label="$t({ id: 'form.validation_code_placeholder' })"
            autofocus
            required
          >
            <template v-slot:append>
              <q-icon name="phone" />
            </template>
          </q-input>

          <div class="error-message q-mt-sm">
            <AppContent
              v-if="errorType === 'wrongCode'"
              entry="error"
              field="invalid_code"
            />
            <AppContent
              v-if="errorType === 'unknown'"
              entry="error"
              field="unknown_happened"
            />
          </div>

          <div class="q-mt-md">
            <q-btn
              color="positive"
              :loading="actionPending"
              type="submit"
              :rounded="style.roundedTheme"
              class="full-width q-my-sm"
              :disabled="sendCodeButtonDisabled"
            >
              <AppContent
                entry="prompt"
                field="send_button"
              />
            </q-btn>
          </div>
        </form>
      </q-card-section>
    </template>

    <template v-slot:step3>
      <q-card-section class="text-center">
        <AppContent
          entry="notification"
          field="validation_success"
        />
      </q-card-section>
      <q-card-section>
        <q-btn
          color="primary"
          :rounded="style.roundedTheme"
          class="full-width q-my-sm"
          @click="closeDialog"
        >
          <AppContent
            entry="navigation"
            field="close"
          />
        </q-btn>
      </q-card-section>
    </template>
  </ValidationDialog>
</template>

<script>
import 'vue-tel-input/dist/vue-tel-input.css'

import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'
import { required } from 'vuelidate/lib/validators'

import ValidationDialog from 'src/components/ValidationDialog'
import VueTelInput from 'vue-tel-input'

export default {
  components: {
    VueTelInput,
    ValidationDialog,
  },
  data () {
    return {
      maxTimeoutPending: 10 * 1000, // 10s
      timeoutPending: null,
      errorType: null,
      actionPending: false,
      displayPhone: '',
      phone: '',
      code: '',
      requestId: '',
      validationSuccess: null,
      validPhone: false,
      wrongCodeAttempts: 0,
    }
  },
  validations: {
    phone: {
      required,
    },
    code: {
      required,
    }
  },
  computed: {
    ...mapState([
      'style',
      'user',
    ]),
    ...mapGetters([
      'selectedUser',
      'countriesCovered',
      'assetsInUniqueCountry',
    ]),
    savePhoneButtonDisabled () {
      return !this.validPhone || this.errorType === 'alreadyVerified'
    },
    sendCodeButtonDisabled () {
      return this.$v.code.$invalid
    },
    preferredCountries () {
      return this.countriesCovered
    },
    defaultCountry () {
      return this.assetsInUniqueCountry || this.preferredCountries[0]
    }
  },
  watch: {
    'user.validationDialog.phone.step' () {
      const step = this.user.validationDialog.phone.step

      if (step === 'requestCode') {
        this.afterRequestingCode()
      } else if (step === 'validationResult') {
        this.afterSendingCode()
      }
    },
  },
  beforeDestroy () {
    clearTimeout(this.timeoutPending)
  },
  methods: {
    closeDialog () {
      this.$store.commit(mutationTypes.TOGGLE_VALIDATION_DIALOG, { visible: false, formType: 'phone' })

      const data = {
        step: null,
        phone: null,
        requestId: null
      }
      this.$store.commit(mutationTypes.SET_VALIDATION_DIALOG_DATA, { data, formType: 'phone' })
      this.reset()
    },
    changePhone ({ number, isValid, country }) {
      this.phone = number
      this.validPhone = isValid

      if (this.selectedUser.phoneVerified && this.phone === this.selectedUser.phone) {
        this.errorType = 'alreadyVerified'
      } else {
        this.errorType = ''
      }
    },
    initPhone () {
      if (!this.selectedUser.phoneVerified) {
        this.phone = this.selectedUser.phone
      } else {
        this.phone = null
      }
    },
    async savePhone ({ goNext }) {
      this.actionPending = true

      try {
        await this.$store.dispatch('sendCustomEvent', {
          type: 'phoneValidation_start',
          objectId: this.selectedUser.id, // automatically populated in event for workflows
          metadata: {
            phone: this.phone,
            signalId: this.$socket.signal_id
          }
        })
      } catch (err) {
        this.errorType = 'unknown'
        this.actionPending = false
      }
    },
    async sendCode ({ goNext }) {
      this.actionPending = true

      // do not eternally lock the send code button
      // to allow users to re-send code if something is blocking
      // in the verification process (recycling the requestId)
      this.timeoutPending = setTimeout(() => {
        this.actionPending = false
      }, this.maxTimeoutPending)

      try {
        await this.$store.dispatch('sendCustomEvent', {
          type: 'phoneValidation_checkCode',
          objectId: this.selectedUser.id, // automatically populated in event for workflows
          metadata: {
            requestId: this.requestId,
            code: this.code,
            signalId: this.$socket.signal_id
          }
        })
      } catch (err) {
        this.errorType = 'unknown'
        this.actionPending = false
        clearTimeout(this.timeoutPending)
      }
    },
    afterRequestingCode () {
      const requestId = this.user.validationDialog.phone.requestId
      const phone = this.user.validationDialog.phone.phone
      const success = this.user.validationDialog.phone.success

      if (phone === this.phone) {
        this.actionPending = false

        if (success) {
          this.requestId = requestId
          this.goNext()
        } else {
          this.errorType = 'unknown'
        }
      }
    },
    afterSendingCode () {
      const requestId = this.user.validationDialog.phone.requestId
      const success = this.user.validationDialog.phone.success
      const wrongCode = this.user.validationDialog.phone.wrongCode

      clearTimeout(this.timeoutPending)

      if (requestId === this.requestId) {
        this.actionPending = false

        this.validationSuccess = success

        if (this.validationSuccess) {
          // non blocking request
          this.$store.dispatch('fetchCurrentUser', { forceRefresh: true })
          this.goNext()
        } else {
          if (wrongCode) {
            this.wrongCodeAttempts += 1
            this.errorType = 'wrongCode'
          } else {
            this.errorType = 'unknown'
          }

          if (this.wrongCodeAttempts > 3) {
            this.closeDialog()
          }

          this.$store.commit({
            type: mutationTypes.SET_VALIDATION_DIALOG_DATA,
            data: {
              step: null, // reset the step so a new event can re-trigger the watcher
            },
            formType: 'phone'
          })
          this.shake()
        }
      }
    },
    goNext () {
      this.$refs.phoneValidationDialog.goNext()
    },
    shake () {
      this.$refs.phoneValidationDialog.shake()
    },
    reset () {
      this.displayPhone = ''
      this.phone = ''
      this.actionPending = false
      this.errorType = ''
      this.actionPending = false
      this.code = ''
      this.requestId = ''
      this.validationSuccess = null
      this.wrongCodeAttempts = 0
    },
  }
}
</script>

<style lang="stylus">
.q-dialog__inner > div
  overflow: initial
</style>
