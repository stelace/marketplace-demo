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
          :icon="icons.matClose"
          @click="onCloseButtonClick"
        />
      </q-card-section>

      <q-card-section
        v-if="type === 'lostPassword' && !SSOLoginOnly"
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
      <q-card-section v-show="type === 'signup'">
        <h2 class="text-center text-h6 q-my-none">
          <AppContent
            entry="user"
            field="select_user_group_helper"
          />
        </h2>
        <q-input
          v-model="user.firstname"
          type="text"
          :label="$t({ id: 'user.firstname_label' })"
          autocomplete="firstname"
          required
        />
      </q-card-section>

      <q-card-section>
        <template v-if="!SSOLoginOnly">
          <form
            v-if="showAuthenticationForm"
            @submit.prevent="authenticate"
          >
            <q-input
              ref="email"
              v-model="user.email"
              type="email"
              :label="$t({ id: 'authentication.placeholder.email' })"
              autocomplete="username"
              autofocus
              required
              :rules="[
                email => !!email || $t({ id: 'form.error.missing_field' }),
                email => isEmail(email) || $t({ id: 'authentication.error.invalid_email' })
              ]"
              lazy-rules
            >
              <template v-slot:append>
                <q-icon :name="icons.matEmail" />
              </template>
            </q-input>
            <q-input
              ref="password"
              v-model="user.password"
              type="password"
              :label="$t({ id: 'authentication.placeholder.password' })"
              autocomplete="current-password"
              required
              minlength="passwordMinLength"
              :rules="[
                password => type === 'login' || !!password || $t({ id: 'form.error.missing_field' }),
                password => type === 'login' || password.length >= passwordMinLength
                  || $t({ id: 'form.error.min_characters' }, { min_number_of_characters: passwordMinLength })
              ]"
              lazy-rules
            >
              <template v-slot:append>
                <q-icon :name="icons.matLock" />
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
              :class="[
                'row items-center q-mt-md q-mb-sm q-pa-sm',
                signupFormSubmitted && !termsAccepted ? 'signup-form-error-background' : ''
              ]"
            >
              <div class="col-2">
                <QCheckbox v-model="termsAccepted" />
              </div>
              <!-- Cannot use QCheckbox template because URL click is prevented -->
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
              ref="email"
              v-model="user.email"
              type="email"
              :label="$t({ id: 'authentication.placeholder.email' })"
              autocomplete="username"
              required
              :rules="[
                email => !!email || $t({ id: 'form.error.missing_field' }),
                email => isEmail(email) || $t({ id: 'authentication.error.invalid_email' })
              ]"
              lazy-rules
            >
              <template v-slot:append>
                <q-icon :name="icons.matEmail" />
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
              ref="password"
              v-model="user.password"
              type="password"
              :label="$t({ id: 'authentication.placeholder.password' })"
              autocomplete="new-password"
              autofocus
              required
              minlength="passwordMinLength"
              :rules="[
                password => !!password || $t({ id: 'form.error.missing_field' }),
                password => password.length >= passwordMinLength
                  || $t({ id: 'form.error.min_characters' }, { min_number_of_characters: passwordMinLength })
              ]"
              lazy-rules
            >
              <template v-slot:append>
                <q-icon :name="icons.matLock" />
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
              ref="newPassword"
              v-model="user.password"
              type="password"
              :label="$t({ id: 'user.account.current_password_label' })"
              autocomplete="password"
              autofocus
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
                <q-icon :name="icons.matLock" />
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
              :rules="[
                newPassword => !!newPassword || $t({ id: 'form.error.missing_field' }),
                newPassword => newPassword.length >= passwordMinLength
                  || $t({ id: 'form.error.min_characters' }, { min_number_of_characters: passwordMinLength })
              ]"
              lazy-rules
            >
              <template v-slot:append>
                <q-icon :name="icons.matLock" />
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
        </template>

        <div
          v-if="type === 'login' && SSOProviders.length"
          class="text-center"
        >
          <div v-if="!SSOLoginOnly" class="q-my-md">
            <AppContent entry="prompt" field="binary_or_separator" />
          </div>

          <QBtn
            v-if="SSOProviders.includes('github')"
            no-caps
            text-color="white"
            class="bg-github"
            @click="ssoLogin('github')"
          >
            <QIcon :name="icons.mdiGithubCircle" left />
            <AppContent
              entry="authentication"
              field="log_in_with_provider"
              :options="{ provider: 'Github' }"
            />
          </QBtn>

          <QBtn
            v-for="provider in customSSOProviders"
            :key="provider"
            no-caps
            color="primary"
            @click="ssoLogin(provider)"
          >
            <AppContent
              entry="authentication"
              field="log_in_with_provider"
              :options="{ provider: upperFirst(provider) }"
            />
          </QBtn>
        </div>

        <template v-if="!SSOLoginOnly">
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
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { upperFirst } from 'lodash'
import * as mutationTypes from 'src/store/mutation-types'
import { matClose, matEmail, matLock } from '@quasar/extras/material-icons'
import { mdiGithubCircle } from '@quasar/extras/mdi-v4'

import EventBus from 'src/utils/event-bus'
import { isEmail } from 'src/utils/string'
import { getInstantRoutePath } from 'src/router/routes'

import { getDisplayName } from 'src/utils/user'
import { getSSOLoginUrl } from 'src/utils/auth'

const passwordMinLength = 8

export default {
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
      },
      newPassword: null,
      actionPending: false,
      termsAccepted: false,
      errorType: null,
      signupFormSubmitted: false,
    }
  },
  computed: {
    ...mapState([
      'auth',
      'style',
    ]),
    ...mapGetters([
      'currentUser',
      'termsPath',
    ]),
    type () {
      return this.auth.authDialogFormType
    },
    isPersistent () {
      return !!(this.auth.authDialogPersistent || this.redirectUrl)
    },
    SSOProviders () {
      if (!process.env.VUE_APP_SSO_PROVIDERS) return []
      return process.env.VUE_APP_SSO_PROVIDERS.split(',').map(p => p.trim())
    },
    SSOLoginOnly () {
      return process.env.VUE_APP_SSO_LOGIN_ONLY === 'true'
    },
    customSSOProviders () {
      const builtInProviders = ['github']
      return this.SSOProviders.filter(p => !builtInProviders.includes(p))
    },
    showAuthenticationForm () {
      return ['signup', 'login'].includes(this.type)
    },
    resetPasswordToken () {
      return this.auth.resetPasswordToken
    },
    termsFullPath () {
      return getInstantRoutePath(this.termsPath)
    }
  },
  created () {
    this.icons = {
      matClose,
      matEmail,
      matLock,
      mdiGithubCircle
    }
  },
  methods: {
    async authenticate () {
      this.actionPending = true

      try {
        this.$refs.email.validate()
        if (this.$refs.email.hasError) return this.shake()

        if (this.type === 'login') {
          await this.$store.dispatch('login', {
            username: this.user.email,
            password: this.user.password
          })
        } else if (this.type === 'signup') {
          this.signupFormSubmitted = true

          this.$refs.password.validate()
          if (this.$refs.password.hasError) return this.shake()

          if (!this.termsAccepted) return this.shake()

          const params = Object.assign({}, this.user)
          params.displayName = getDisplayName(this.user.firstname)
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
        EventBus.$emit('authStatusChanged', 'success')

        this.resetForm()
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
        } else {
          throw err
        }

        EventBus.$emit('authStatusChanged', 'failure')
      } finally {
        this.actionPending = false
      }
    },
    async sendLostPassword () {
      this.actionPending = true

      try {
        this.$refs.email.validate()
        if (this.$refs.email.hasError) return this.shake()

        await this.$store.dispatch('sendResetPasswordRequest', {
          username: this.user.email
        }).catch(err => {
          // test env only: 422 means the user does not exist.
          // in live environment, no error is generated by API for security reasons
          if (err.statusCode !== 422) throw err
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
        this.$refs.password.validate()
        if (this.$refs.password.hasError) return this.shake()

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
        this.$refs.newPassword.validate()
        if (this.$refs.newPassword.hasError) return this.shake()

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

      // the user should be able to start typing before getting an error,
      // but email field shares the same name in different forms,
      // which prematurely triggers the error message on blur.
      if (['lostPassword', 'login', 'signup'].includes(type)) {
        this.$refs.email.resetValidation()
        this.$refs.email.focus() // autofocus doesn’t work when changing forms
      }

      this.errorType = null
    },
    resetForm () {
      this.user = {}
      this.newPassword = null
      this.termsAccepted = false
      this.errorType = null
      this.signupFormSubmitted = false

      this.$refs.email.resetValidation()
      this.$refs.password.resetValidation()
      this.$refs.newPassword.validate.resetValidation()
    },
    shake () {
      this.$refs.authDialog.shake() // Quasar method
    },
    ssoLogin (provider) {
      const loginUrl = getSSOLoginUrl(provider)

      // store the current URL path so users will be redirected to it
      // after authentication
      const urlPath = this.$route.fullPath
      window.localStorage.setItem('ssoRedirectUrlPath', urlPath)

      window.location.href = loginUrl
    },
    upperFirst (str) {
      return upperFirst(str)
    },
    isEmail
  }
}
</script>

<style lang="stylus" scoped>
.auth-card
  min-width: 20rem

.auth-card .q-card__section
  @media (min-width $breakpoint-sm-min)
    max-width: 25rem

.auth-card .error-message
  color: $negative

.signup-form-error-background
  background: rgba($negative, 0.1)
  border-radius: $generic-border-radius
</style>
