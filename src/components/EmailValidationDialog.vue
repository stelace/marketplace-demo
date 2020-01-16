<template>
  <ValidationDialog
    :opened="user.validationDialog.email.opened"
    :nb-steps="2"
    @close="closeDialog"
    @open="initEmail"
  >
    <template v-slot:step1="{ goNext }">
      <q-card-section class="text-center">
        <AppContent
          entry="user"
          field="account.new_email_address_helper"
          :options="{
            email: selectedUser.emailVerified && selectedUser.email || undefined
          }"
        />
      </q-card-section>
      <q-card-section>
        <form @submit.prevent="saveEmail({ goNext })">
          <q-input
            v-model.trim="email"
            type="email"
            :label="$t({ id: 'authentication.placeholder.email' })"
            autofocus
            required
          >
            <template v-slot:append>
              <q-icon :name="icons.matEmail" />
            </template>
          </q-input>

          <div class="error-message q-mt-sm">
            <AppContent
              v-if="alreadyValidatedEmail"
              entry="notification"
              field="already_validated"
            />
            <AppContent
              v-if="errorType === 'unknown'"
              entry="error"
              field="unknown_happened_header"
            />
          </div>

          <div class="q-mt-md">
            <q-btn
              color="positive"
              :loading="actionPending"
              type="submit"
              :rounded="style.roundedTheme"
              class="full-width q-my-sm"
              :disabled="saveEmailButtonDisabled"
            >
              <AppContent
                entry="prompt"
                field="verify"
              />
            </q-btn>
          </div>
        </form>
      </q-card-section>
    </template>

    <template v-slot:step2>
      <q-card-section class="text-center">
        <AppContent
          entry="user"
          field="account.new_email_address_success"
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
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'
import { required, email } from 'vuelidate/lib/validators'
import { matEmail } from '@quasar/extras/material-icons'

import ValidationDialog from 'src/components/ValidationDialog'

export default {
  components: {
    ValidationDialog,
  },
  data () {
    return {
      type: 'email',
      errorType: null,
      actionPending: false,
      email: '',
    }
  },
  validations: {
    email: {
      required,
      email
    }
  },
  computed: {
    ...mapState([
      'style',
      'user',
    ]),
    ...mapGetters([
      'selectedUser',
    ]),
    saveEmailButtonDisabled () {
      return this.$v.email.$invalid || this.alreadyValidatedEmail
    },
    alreadyValidatedEmail () {
      return this.selectedUser.emailVerified && this.selectedUser.email && this.selectedUser.email === this.email
    }
  },
  created () {
    this.icons = { matEmail }
  },
  methods: {
    closeDialog () {
      this.$store.commit(mutationTypes.TOGGLE_VALIDATION_DIALOG, { visible: false, formType: 'email' })
    },
    initEmail () {
      if (!this.selectedUser.emailVerified) {
        // set `undefined` for translations
        this.email = this.selectedUser.email
      }
    },
    async saveEmail ({ goNext }) {
      this.actionPending = true

      try {
        await this.$store.dispatch('sendCustomEvent', {
          type: 'email_check_request',
          objectId: this.selectedUser.id, // automatically populated in event for workflows
          metadata: {
            email: this.email,
          }
        })

        this.email = null

        goNext()
      } catch (err) {
        this.errorType = 'unknown'
      } finally {
        this.actionPending = false
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
</style>
