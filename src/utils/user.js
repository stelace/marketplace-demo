import { get, isString } from 'lodash'
import { convertApiToDisplayScore } from 'src/utils/rating'

const taxIdRegex = /^FR([A-HJ-NP-Z\d]{2}\d{9})$/

// Getting user.categoryId from user.metadata.metadata.instant.categoryId
// Advice: use lodash get to safely access values
export const userMetadataMapping = {
  categoryId: 'metadata.instant.categoryId',
  avatarUrl: 'metadata.instant.avatarUrl',
  twitterHandle: 'metadata.instant.twitterHandle',
  publicName: 'metadata.instant.publicName',
  profileTitle: 'metadata.instant.profileTitle',
  profileSalary: 'metadata.instant.profileSalary',
  locations: 'metadata.instant.locations',

  images: 'metadata.images',

  averageRating: 'metadata.instant.averageRating',
  score: 'metadata.instant.score',

  firstName: 'metadata._premium.firstname',
  lastName: 'metadata._premium.lastname',
  phone: 'metadata._private.phone',

  newEmail: 'platformData._private.newEmail',

  taxId: 'metadata._private.taxId',

  emailVerified: 'platformData.instant.emailVerified',
  phoneVerified: 'platformData.instant.phoneVerified',
  taxIdVerified: 'platformData.instant.taxIdVerified',

  assetId: 'platformData.instant.assetId',
  availabilityId: 'platformData.instant.availabilityId',

  experiences: 'metadata.instant.experiences',
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
  categoriesById,
  ratingsStatsByType,
  ratingsOptions,
  isCurrentUser,
  nbRecommendations,
  recommendedBy
} = {}) {
  // user can select a category on platform to get appropriate suggestion and offers
  user.categoryId = get(user, userMetadataMapping.categoryId, '')
  if (categoriesById && user.categoryId) {
    user.category = categoriesById[user.categoryId] || '' // categories can be missing in store
    user.categoryName = user.category ? user.category.name : ''
  }

  user.avatarUrl = get(user, userMetadataMapping.avatarUrl, '')
  user.emailVerified = get(user, userMetadataMapping.emailVerified, false)
  user.phoneVerified = get(user, userMetadataMapping.phoneVerified, false)
  user.twitterHandle = get(user, userMetadataMapping.twitterHandle, '')
  user.publicName = get(user, userMetadataMapping.publicName, '')
  user.profileTitle = get(user, userMetadataMapping.profileTitle, '')
  user.profileSalary = get(user, userMetadataMapping.profileSalary, '')
  user.locations = get(user, userMetadataMapping.locations) || []
  user.locationName = get(user.locations, '[0].shortDisplayName', '')

  user.images = get(user, userMetadataMapping.images, [])

  user.assetId = get(user, userMetadataMapping.assetId, '')
  user.availabilityId = get(user, userMetadataMapping.availabilityId, '')

  if (ratingsStatsByType && ratingsOptions) {
    const defaultAvgScore = get(ratingsStatsByType, `default.${user.id}.avg`, null)
    const completionAvgScore = get(ratingsStatsByType, `completionScore.${user.id}.avg`, null)

    user.averageRating = convertApiToDisplayScore(
      defaultAvgScore,
      { displayMaxScore: get(ratingsOptions, 'stats.default.maxScore') }
    )
    user.score = convertApiToDisplayScore(
      completionAvgScore,
      { displayMaxScore: get(ratingsOptions, 'stats.completionScore.maxScore') }
    )
  }

  user.nbRecommendations = nbRecommendations
  user.recommendedBy = (recommendedBy || []).map(u => {
    populateUser(u, { isCurrentUser: false }) // only get avatar information
    return u
  })

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

  user.taxId = get(user, userMetadataMapping.taxId, '')
  user.taxIdVerified = get(user, userMetadataMapping.taxIdVerified, '')

  user.experiences = get(user, userMetadataMapping.experiences, [])
}

export function isValidTaxId (taxId) {
  return isString(taxId) && taxIdRegex.test(taxId)
}

export function getDisplayName (firstname, lastname) {
  if (!firstname) return ''

  let displayName = firstname
  if (lastname) {
    displayName += ` ${(lastname || '').charAt(0)}.`
  }

  return displayName
}
