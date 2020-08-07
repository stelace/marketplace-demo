import { get } from 'lodash'
import { convertApiToDisplayScore } from 'src/utils/rating'

// Getting user.categoryId from user.metadata.metadata.instant.categoryId
// Advice: use lodash get to safely access values
export const userMetadataMapping = {
  avatarUrl: 'metadata.instant.avatarUrl',
  publicName: 'metadata.instant.publicName',
  profileTitle: 'metadata.instant.profileTitle',
  locations: 'metadata.instant.locations',
  deliveryAddress: 'metadata.instant.deliveryAddress',

  images: 'metadata.images',

  averageRating: 'metadata.instant.averageRating',
  score: 'metadata.instant.score',

  firstName: 'metadata._premium.firstname',
  lastName: 'metadata._premium.lastname',
  phone: 'metadata._private.phone',

  newEmail: 'platformData._private.newEmail',

  emailVerified: 'platformData.instant.emailVerified',
}

export function isProvider (user) {
  const u = user // assign here to enable VueJS reactivity
  const roles = get(u, 'roles', [])
  return roles.includes('provider')
}

export function isUser (user) {
  const u = user // assign here to enable VueJS reactivity
  const roles = get(u, 'roles', [])
  return roles.includes('user')
}

export function populateUser (user, {
  ratingsStatsByTargetId,
  ratingsOptions,
  isCurrentUser,
} = {}) {
  user.avatarUrl = get(user, userMetadataMapping.avatarUrl, '')
  user.emailVerified = get(user, userMetadataMapping.emailVerified, false)
  user.publicName = get(user, userMetadataMapping.publicName, '')
  user.profileTitle = get(user, userMetadataMapping.profileTitle, '')
  user.locations = get(user, userMetadataMapping.locations) || []
  user.locationName = get(user.locations, '[0].shortDisplayName', '')
  user.deliveryAddress = get(user, userMetadataMapping.deliveryAddress, '')

  user.images = get(user, userMetadataMapping.images, [])

  if (ratingsStatsByTargetId && ratingsOptions) {
    const defaultAvgScore = get(ratingsStatsByTargetId, `default.${user.id}.avg`, null)

    user.averageRating = convertApiToDisplayScore(
      defaultAvgScore,
      { displayMaxScore: get(ratingsOptions, 'stats.default.maxScore') }
    )
  }

  // Visibility can depend on viewing user access rights
  if (isCurrentUser) {
    user.firstName = user.firstname
    user.lastName = user.lastname
    user.phone = get(user, userMetadataMapping.phone, '')
  } else {
    user.firstName = get(user, userMetadataMapping.firstName, '')
    user.lastName = get(user, userMetadataMapping.lastName, '')
  }

  user.newEmail = get(user, userMetadataMapping.newEmail, '')
}

export function getDisplayName (firstname, lastname) {
  if (!firstname) return ''

  let displayName = firstname
  if (lastname) {
    displayName += ` ${(lastname || '').charAt(0)}.`
  }

  return displayName
}
