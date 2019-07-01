<template>
  <q-dialog
    ref="authDialog"
    :value="auth.authDialogOpened"
    :maximized="$q.screen.lt.sm"
    :persistent="isPersistent"
    transition-show="slide-top"
    transition-hide="slide-bottom"
    @show="onOpenAuthDialog"
    @hide="closeAuthDialog"
  >
    <q-card class="q-pa-md auth-card">
      <q-card-section class="text-center">
        <div
          v-if="title"
          class="text-h6 q-mb-md"
        >
          {{ title }}
        </div>
        <div
          v-if="greeting"
          class="text-body1"
        >
          {{ greeting }}
        </div>
        <q-btn
          v-close-popup
          flat
          :rounded="style.roundedTheme"
          color="primary"
          class="absolute-top-right"
          label="X"
          @click="onCloseButtonClick"
        />
      </q-card-section>
      <q-card-section
        v-if="type === 'lostPassword'"
        class="text-center"
      >
        <AppContent
          entry="authentication"
          field="lost_password_message"
        />
      </q-card-section>
      <q-card-section
        v-if="type === 'resetPassword'"
        class="text-center"
      >
        <AppContent
          entry="authentication"
          field="password_reset.message"
        />
      </q-card-section>
      <q-card-section v-show="showAuthDialogUserType">
        <AuthDialogUserType
          :roles.sync="user.roles"
          :firstname.sync="user.firstname"
          :lastname.sync="user.lastname"
          :display-name.sync="user.displayName"
          :visible-user-types="authDialogActionConfig.userTypes"
          @is-valid="isValidUserType"
        />
      </q-card-section>
      <q-card-section>
        <form
          v-if="showAuthenticationForm"
          @submit.prevent="authenticate"
        >
          <q-input
            v-model="user.email"
            type="email"
            :label="$t({ id: 'authentication.placeholder.email' })"
            autocomplete="username"
            autofocus
            required
          >
            <template v-slot:append>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input
            v-model="user.password"
            type="password"
            :label="$t({ id: 'authentication.placeholder.password' })"
            autocomplete="current-password"
            required
            minlength="passwordMinLength"
          >
            <template v-slot:append>
              <q-icon name="lock" />
            </template>
          </q-input>

          <div class="error-message q-mt-sm">
            <AppContent
              v-if="errorType === 'loginIncorrect'"
              entry="authentication"
              field="error.incorrect"
            />
            <AppContent
              v-if="errorType === 'signupEmailAlreadyUsed'"
              entry="authentication"
              field="error.email_already_used"
            />
          </div>

          <div
            v-show="type === 'signup'"
            class="row items-center q-mt-lg q-mb-md"
          >
            <div class="col-2">
              <QCheckbox v-model="termsAccepted" />
            </div>
            <!-- Cannot use QCheckbox template because click is prevented -->
            <div
              class="col-10 anchor-text--reset anchor-text--underline-focus cursor-pointer"
              @click="termsAccepted = !termsAccepted"
            >
              <AppContent
                entry="authentication"
                field="terms_optin"
                :options="{ terms_path: termsFullPath }"
              />
            </div>
          </div>

          <q-btn
            color="primary"
            :loading="actionPending"
            type="submit"
            :rounded="style.roundedTheme"
            class="full-width q-my-md"
            :disabled="authButtonDisabled"
          >
            <span v-show="type === 'login'">
              <AppContent
                entry="authentication"
                field="log_in_button"
              />
            </span>
            <span v-show="type === 'signup'">
              <AppContent
                entry="authentication"
                field="sign_up_button"
              />
            </span>
          </q-btn>
        </form>
        <form
          v-if="type === 'lostPassword'"
          @submit.prevent="sendLostPassword"
        >
          <q-input
            v-model="user.email"
            type="email"
            :label="$t({ id: 'authentication.placeholder.email' })"
            autocomplete="username"
            required
          >
            <template v-slot:append>
              <q-icon name="email" />
            </template>
          </q-input>

          <div class="error-message q-mt-sm">
            <AppContent
              v-if="errorType === 'unknown'"
              entry="error"
              field="unknown_happened_header"
            />
          </div>

          <q-btn
            color="primary"
            :loading="actionPending"
            type="submit"
            :rounded="style.roundedTheme"
            class="full-width q-my-md"
            :disabled="lostPasswordButtonDisabled"
          >
            <span>
              <AppContent
                entry="prompt"
                field="send_button"
              />
            </span>
          </q-btn>
        </form>
        <form
          v-if="type === 'resetPassword'"
          @submit.prevent="resetPassword"
        >
          <q-input
            v-model="user.password"
            type="password"
            :label="$t({ id: 'authentication.placeholder.password' })"
            autocomplete="new-password"
            required
            minlength="passwordMinLength"
          >
            <template v-slot:append>
              <q-icon name="lock" />
            </template>
          </q-input>

          <div class="error-message q-mt-sm">
            <AppContent
              v-if="errorType === 'resetPasswordLinkExpired'"
              entry="authentication"
              field="password_reset.link_expired"
            />
            <AppContent
              v-if="errorType === 'resetPasswordLinkInvalid'"
              entry="authentication"
              field="password_reset.link_invalid"
            />
            <AppContent
              v-if="errorType === 'unknown'"
              entry="error"
              field="unknown_happened_header"
            />
          </div>

          <q-btn
            color="primary"
            :loading="actionPending"
            type="submit"
            :rounded="style.roundedTheme"
            class="full-width q-my-md"
            :disabled="resetPasswordButtonDisabled"
          >
            <span>
              <AppContent
                entry="prompt"
                field="send_button"
              />
            </span>
          </q-btn>
        </form>
        <form
          v-if="type === 'changePassword'"
          @submit.prevent="changePassword"
        >
          <q-input
            v-model="user.password"
            type="password"
            :label="$t({ id: 'user.account.current_password_label' })"
            autocomplete="password"
            required
            minlength="passwordMinLength"
            :bottom-slots="errorType === 'incorrectCurrentPassword'"
            :error="errorType === 'incorrectCurrentPassword'"
          >
            <template v-slot:error>
              <AppContent
                v-if="errorType === 'incorrectCurrentPassword'"
                entry="user"
                field="account.incorrect_current_password"
              />
            </template>
            <template v-slot:append>
              <q-icon name="lock" />
            </template>
          </q-input>
          <q-input
            v-model="newPassword"
            type="password"
            :label="$t({ id: 'user.account.new_password_label' })"
            autocomplete="new-password"
            required
            minlength="passwordMinLength"
            class="q-mt-sm"
          >
            <template v-slot:append>
              <q-icon name="lock" />
            </template>
          </q-input>

          <div class="error-message q-mt-sm">
            <AppContent
              v-if="errorType === 'unknown'"
              entry="error"
              field="unknown_happened_header"
            />
          </div>

          <q-btn
            color="primary"
            :loading="actionPending"
            type="submit"
            :rounded="style.roundedTheme"
            class="full-width q-my-md"
            :disabled="changePasswordButtonDisabled"
          >
            <span>
              <AppContent
                entry="prompt"
                field="save_button"
              />
            </span>
          </q-btn>
        </form>

        <q-btn
          v-if="type === 'login'"
          flat
          no-caps
          :rounded="style.roundedTheme"
          color="primary"
          class="block q-mx-auto"
          @click="changeFormType('lostPassword')"
        >
          {{ $t({ id: 'authentication.lost_password_button' }) }}
        </q-btn>

        <q-separator
          v-if="showAuthenticationForm"
          class="q-my-md"
        />

        <q-btn
          v-if="type === 'lostPassword'"
          flat
          no-caps
          :rounded="style.roundedTheme"
          color="secondary"
          class="block q-mx-auto"
          @click="changeFormType('login')"
        >
          <AppContent
            entry="navigation"
            field="back"
          />
        </q-btn>
        <q-btn
          v-if="type === 'login'"
          flat
          no-caps
          :rounded="style.roundedTheme"
          color="secondary"
          class="block q-mx-auto"
          @click="changeFormType('signup')"
        >
          <AppContent
            entry="authentication"
            field="no_account_button"
          />
        </q-btn>
        <q-btn
          v-if="type === 'signup'"
          flat
          no-caps
          :rounded="style.roundedTheme"
          color="secondary"
          class="block q-mx-auto"
          @click="changeFormType('login')"
        >
          <AppContent
            entry="authentication"
            field="existing_account_button"
          />
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'
import { required, email, minLength } from 'vuelidate/lib/validators'

import EventBus from 'src/utils/event-bus'
import { getInstantRoutePath } from 'src/router/routes'

import AuthDialogUserType from 'src/components/AuthDialogUserType'

const passwordMinLength = 8

export default {
  components: {
    AuthDialogUserType
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    greeting: {
      type: String,
      default: '',
    },
    redirectUrl: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      passwordMinLength,
      user: {
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        displayName: '',
        roles: []
      },
      newPassword: null,
      validUserType: false,
      actionPending: false,
      termsAccepted: false,
      errorType: null
    }
  },
  validations: {
    user: {
      email: {
        required,
        email
      },
      password: {
        required,
        minLength: minLength(8)
      }
    },
    newPassword: {
      required,
      minLength: minLength(8)
    }
  },
  computed: {
    ...mapState([
      'auth',
      'style',
    ]),
    ...mapGetters([
      'currentUser',
      'authDialogActionConfig',
      'termsPath',
    ]),
    type () {
      return this.auth.authDialogFormType
    },
    isPersistent () {
      return !!(this.auth.authDialogPersistent || this.redirectUrl)
    },
    showAuthenticationForm () {
      return ['signup', 'login'].includes(this.type)
    },
    authButtonDisabled () {
      return this.$v.user.email.$invalid ||
        this.$v.user.password.$invalid ||
        (this.type === 'signup' && (!this.validUserType || !this.termsAccepted))
    },
    lostPasswordButtonDisabled () {
      return this.type === 'lostPassword' && this.$v.user.email.$invalid
    },
    resetPasswordButtonDisabled () {
      return this.type === 'resetPassword' && this.$v.user.password.$invalid
    },
    changePasswordButtonDisabled () {
      return this.type === 'changePassword' &&
        (this.$v.user.password.$invalid || this.$v.newPassword.$invalid)
    },
    resetPasswordToken () {
      return this.auth.resetPasswordToken
    },
    showAuthDialogUserType () {
      return this.type === 'signup'
    },
    termsFullPath () {
      return getInstantRoutePath(this.termsPath)
    }
  },
  methods: {
    async authenticate () {
      this.actionPending = true

      try {
        if (this.type === 'login') {
          await this.$store.dispatch('login', {
            username: this.user.email,
            password: this.user.password
          })
        } else if (this.type === 'signup') {
          const params = Object.assign({}, this.user)
          params.username = params.email
          params.metadata = {
            instant: {
              termsAccepted: this.termsAccepted
            }
          }

          await this.$store.dispatch('signup', {
            userAttrs: params
          })
        }

        if (this.redirectUrl) {
          this.$router.push(this.redirectUrl)
        } else {
          if (this.type === 'signup' && this.auth.redirectAfterSignup) {
            this.$router.push({ name: 'publicProfile', params: { id: this.currentUser.id } })
          }
        }

        this.closeAuthDialog({ triggerEvent: false })
        this.resetForm()

        EventBus.$emit('authStatusChanged', 'success')
      } catch (err) {
        this.shake()

        if (this.type === 'login') {
          if (err.statusCode === 403) {
            this.errorType = 'loginIncorrect'
          }
        } else if (this.type === 'signup') {
          if (err.statusCode === 422 && err.message === 'Unavailable username') {
            this.errorType = 'signupEmailAlreadyUsed'
          }
        }

        EventBus.$emit('authStatusChanged', 'failure')

        throw err
      } finally {
        this.actionPending = false
      }
    },
    async sendLostPassword () {
      this.actionPending = true

      try {
        await this.$store.dispatch('sendResetPasswordRequest', {
          username: this.user.email
        }).catch(err => {
          // if the error status code is 403, it means the user doesn't exist
          // handle it as we sent email for security reasons
          if (err.statusCode !== 403) {
            throw err
          }
        })

        this.notifySuccess('authentication.lost_password_email_sent')

        this.resetForm()
        this.closeAuthDialog({ triggerEvent: false })
      } catch (err) {
        this.shake()

        this.errorType = 'unknown'
      } finally {
        this.actionPending = false
      }
    },
    async resetPassword () {
      this.actionPending = true

      try {
        await this.$store.dispatch('sendResetPasswordConfirmation', {
          resetToken: this.auth.resetPasswordToken,
          newPassword: this.user.password
        })

        this.resetForm()
        this.closeAuthDialog({ triggerEvent: false })

        this.$store.commit({
          type: mutationTypes.SET_RESET_PASSWORD_TOKEN,
          resetToken: null
        })

        this.$router.replace({ name: 'home' })

        this.notifySuccess('authentication.password_reset.success')
      } catch (err) {
        this.shake()

        if (err.statusCode === 403 && err.message === 'Reset token expired') {
          this.errorType = 'resetPasswordLinkExpired'
        } else if (err.statusCode === 403) {
          this.errorType = 'resetPasswordLinkInvalid'
        } else {
          this.errorType = 'unknown'
        }
      } finally {
        this.actionPending = false
      }
    },
    async changePassword () {
      this.actionPending = true

      try {
        await this.$store.dispatch('changePassword', {
          currentPassword: this.user.password,
          newPassword: this.newPassword
        })

        this.resetForm()
        this.closeAuthDialog({ triggerEvent: false })

        this.notifySuccess('notification.saved')
      } catch (err) {
        this.shake()

        if (err.statusCode === 422 && err.message === 'Incorrect current password') {
          this.errorType = 'incorrectCurrentPassword'
        } else {
          this.errorType = 'unknown'
        }
      } finally {
        this.actionPending = false
      }
    },
    onCloseButtonClick () {
      if (this.type === 'resetPassword') {
        this.$router.replace({ name: 'home' })
        return
      }

      if (this.redirectUrl) {
        this.$router.push('/')

        const { query } = this.$route
        const newQuery = Object.assign({}, query)
        delete newQuery.redirect

        this.$router.replace({ query: newQuery })
      } else if (this.isPersistent) {
        // always display the close button,
        // otherwise there is no way for users to leave the dialog

        this.goToPreviousPage()
        this.notifyWarning('error.login_to_access_page')
      }
    },
    isValidUserType (isValidUserType) {
      this.validUserType = isValidUserType
    },
    onOpenAuthDialog () {
      EventBus.$emit('authStatusChanged', 'opened')
    },
    closeAuthDialog ({ triggerEvent = true } = {}) {
      this.$store.commit(mutationTypes.TOGGLE_AUTH_DIALOG, { visible: false, persistent: false })

      this.$store.commit({
        type: mutationTypes.SET_AUTH_DIALOG_FORM_TYPE,
        formType: 'login'
      })
      this.$store.commit({
        type: mutationTypes.SET_AUTH_DIALOG_REDIRECTION_AFTER_SIGNUP,
        redirectAfterSignup: false
      })
      this.$store.commit({
        type: mutationTypes.SET_AUTH_DIALOG_ACTION,
        action: null
      })

      if (triggerEvent) {
        EventBus.$emit('authStatusChanged', 'closed')
      }
    },
    changeFormType (type) {
      this.$store.commit({
        type: mutationTypes.SET_AUTH_DIALOG_FORM_TYPE,
        formType: type
      })

      this.errorType = null
    },
    resetForm () {
      this.user = {}
      this.newPassword = null
      this.termsAccepted = false
      this.errorType = null
    },
    shake () {
      this.$refs.authDialog.shake()
    }
  }
}
</script>

<style lang="stylus" scoped>
.auth-card
  min-width: 20rem

.auth-card .q-card__section
  @media (min-width $breakpoint-sm-min)
    max-width: 20rem

.auth-card .error-message
  color: $negative
</style>
