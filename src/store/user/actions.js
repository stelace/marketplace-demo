/* eslint-disable camelcase */

import stelace from 'src/utils/stelace'
import { set, isEmpty, isUndefined, values } from 'lodash'

import * as types from 'src/store/mutation-types'

import { userMetadataMapping, getDisplayName } from 'src/utils/user'
import { paymentsApi } from 'src/utils/url'

const metadataAttrs = Object.keys(userMetadataMapping)

export async function fetchUser ({ commit }, { userId }) {
  const user = await stelace.users.read(userId)

  commit({
    type: types.SET_SELECTED_USER,
    user
  })

  return user
}

export async function updateUser ({ commit, rootGetters }, { userId, attrs }) {
  if (isEmpty(attrs)) throw new Error('User update attrs expected')

  const currentUser = rootGetters.currentUser

  const shouldUpdateDisplayName = !isUndefined(attrs.firstname) || !isUndefined(attrs.lastname)

  if (shouldUpdateDisplayName) {
    attrs.displayName = getDisplayName(attrs.firstname || currentUser.firstname, attrs.lastname || currentUser.lastname)
  }

  const transformedAttrs = prepareUpdateAttrsMetadata(attrs)
  const user = await stelace.users.update(userId, transformedAttrs)

  commit({
    type: types.SET_CURRENT_USER,
    user
  })

  // should also commit to selected user
  // otherwise selected user data will be obsolete if the user logs out

  // DRAWBACK: private fields remain in store until a new selected user is stored
  // but it is ok as the data aren't displayed
  commit({
    type: types.SET_SELECTED_USER,
    user
  })

  const isOrganization = user.roles.includes('organization')
  if (isOrganization) {
    const currentOrganizations = rootGetters.currentOrganizations
    const updatedCurrentOrganizations = currentOrganizations.map(org => {
      if (org.id === user.id) {
        return user
      } else {
        return org
      }
    })

    commit({
      type: types.SET_ORGANIZATIONS,
      organizations: updatedCurrentOrganizations
    })
  }
}

export async function createOrganization ({ commit, dispatch, rootState, rootGetters }, { attrs = {}, selectAfterCreate = true } = {}) {
  const naturalUser = rootGetters.currentNaturalUser

  const transformedAttrs = prepareUpdateAttrsMetadata(attrs)
  transformedAttrs.type = 'organization'
  set(transformedAttrs, 'metadata.instant.contactId', naturalUser.id)

  const createAttrs = Object.assign({}, transformedAttrs)

  const organization = await stelace.users.create(createAttrs, {
    stelaceOrganizationId: null
  })

  // wait for some workflows operations to complete in server
  await new Promise(resolve => setTimeout(resolve, 2000))

  const updatedOrganization = await stelace.users.read(organization.id, {
    stelaceOrganizationId: organization.id
  })

  const organizationsById = rootState.auth.organizationsById

  commit({
    type: types.SET_ORGANIZATIONS,
    organizations: values(organizationsById).concat([updatedOrganization])
  })

  if (selectAfterCreate) {
    await dispatch('selectOrganization', { organizationId: updatedOrganization.id })
  }
}

function prepareUpdateAttrsMetadata (attrs) {
  const newAttrs = Object.assign({}, attrs)

  // Supports root properties only
  Object.keys(attrs).forEach(a => {
    if (metadataAttrs.includes(a)) {
      set(newAttrs, userMetadataMapping[a], attrs[a])
      delete newAttrs[a]
    }
  })

  return newAttrs
}

export async function linkStripeAccount ({ dispatch, rootGetters }, { code }) {
  const currentUserId = rootGetters.currentUser.id
  const url = paymentsApi.linkStripeAccount

  await stelace.forward.post(url, {
    userId: currentUserId,
    code
  })

  await dispatch('fetchCurrentUser', { forceRefresh: true })
}
