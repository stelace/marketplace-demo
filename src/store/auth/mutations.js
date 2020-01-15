
import { keyBy } from 'lodash'
import * as types from 'src/store/mutation-types'

import EventBus from 'src/utils/event-bus'

export default {
  [types.TOGGLE_AUTH_DIALOG] (state, { visible, persistent } = {}) {
    state.authDialogOpened = typeof visible === 'boolean' ? visible : !state.authDialogOpened
    state.authDialogPersistent = typeof persistent === 'boolean' ? persistent : state.authDialogPersistent
  },

  [types.SET_AUTH_DIALOG_FORM_TYPE] (state, { formType } = {}) {
    const allowedFormTypes = [
      'login',
      'signup',
      'lostPassword',
      'resetPassword',
      'changePassword'
    ]

    if (allowedFormTypes.includes(formType)) {
      state.authDialogFormType = formType
    }
  },

  [types.SET_AUTH_DIALOG_REDIRECTION_AFTER_SIGNUP] (state, { redirectAfterSignup }) {
    state.redirectAfterSignup = redirectAfterSignup
  },

  [types.SET_AUTH_DIALOG_ACTION] (state, { action }) {
    state.authDialogAction = action
  },

  [types.SET_RESET_PASSWORD_TOKEN] (state, { resetToken }) {
    state.resetPasswordToken = resetToken
  },

  [types.SET_CURRENT_USER] (state, { user }) {
    const previousUser = state.user
    const newUser = user
    const sameUser = (previousUser && newUser && previousUser.id === newUser.id) ||
      (!previousUser && !newUser)

    state.user = user

    // emit an event to recreate the socket
    // for the new current user
    if (!sameUser) refreshSocket()
  },

  [types.SET_NATURAL_USER] (state, { user }) {
    state.naturalUser = user
  },

  [types.SET_ORGANIZATIONS] (state, { organizations }) {
    state.organizationsById = keyBy(organizations, 'id')
  },

  [types.SET_IS_NEW_USER] (state, { isNewUser }) {
    state.isNewUser = isNewUser
  }
}

function refreshSocket () {
  EventBus.$emit('refreshSocket')
}
