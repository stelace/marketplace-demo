import { get, pick } from 'lodash'

export function assetsInUniqueCountry (state) {
  const uniqueCountry = get(state.config, 'stelace.instant.assetsInUniqueCountry')
  const uniqueCountryActive = get(state.config, 'stelace.instant.assetsInUniqueCountryActive', false)

  if (!uniqueCountryActive) return '' // use a string here because of component prop type String
  return uniqueCountry
}

export function countriesCovered (state) {
  const countriesCovered = get(state.config, 'stelace.instant.countriesCovered')
  const countriesCoveredActive = get(state.config, 'stelace.instant.countriesCoveredActive', false)

  if (!countriesCoveredActive) return []
  return countriesCovered
}

export function socialInfo (state) {
  const d = get(state.config, 'stelace.instant', {})

  return pick(d, [
    'facebookUrl',
    'twitterUsername',
    'instagramUsername'
  ])
}

export function searchOptions (state) {
  const searchOptions = get(state.config, 'stelace.instant.searchOptions', {})
  if (!searchOptions.modes) {
    searchOptions.modes = {}
  }

  return searchOptions
}

export function ratingsOptions (state) {
  const ratingsOptions = get(state.config, 'stelace.instant.ratingsOptions', {})
  if (!ratingsOptions.stats) {
    ratingsOptions.stats = {}
  }
  if (!ratingsOptions.types) {
    ratingsOptions.types = {}
  }

  return ratingsOptions
}
