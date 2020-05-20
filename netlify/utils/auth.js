import { get } from 'lodash'

export function isAuthenticated (context) {
  return context.auth && context.auth.valid
}

export function isUser (context, userId) {
  return isAuthenticated(context) && get(context, 'auth.user.userId') === userId
}
