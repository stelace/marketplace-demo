import axios from 'axios'
import { uniqBy, get } from 'lodash'

const host = process.env.VUE_APP_NOMINATIM_HOST
const key = process.env.VUE_APP_NOMINATIM_KEY

// API: https://developer.mapquest.com/documentation/open/nominatim-search/search/

export async function search (query, { country } = {}) {
  checkProviderInfo()

  const encodedQuery = encodeURIComponent(query)

  let formattedCountries
  if (country) {
    if (Array.isArray(country)) {
      formattedCountries = country.join(',')
    } else {
      formattedCountries = country
    }
  }

  const url = host +
    '/nominatim/v1/search.php' +
    `?key=${key}` +
    '&format=json' +
    '&q=' + encodedQuery +
    '&addressdetails=1' +
    (formattedCountries ? '&countrycodes=' + formattedCountries : '')

  let headers
  // add the accept-language into header for localization (only in browser environment)
  if (typeof window === 'object') {
    const language = (window.navigator.languages && window.navigator.languages.join(',')) ||
      window.navigator.language ||
      window.navigator.userLanguage

    headers = {
      'accept-language': language
    }
  }

  const { data: results } = await axios.get(url, { headers })

  const uniqueResults = uniqBy(results, result => result.display_name)

  return uniqueResults.map(formatPlacesResult)
}

export function extractLocationDataFromPlace (place, handlerFn) {
  const { latitude, longitude, shortDisplayName, displayName, postcode } = place || {}
  let location = null

  if ([latitude, longitude].every(Number.isFinite)) {
    location = { latitude, longitude, shortDisplayName, displayName, postcode }
  }
  if (typeof handlerFn === 'function') {
    handlerFn(location)
  }

  return location
}

function checkProviderInfo () {
  if (!host) {
    throw new Error('Missing search places provider host')
  }
  if (!key) {
    throw new Error('Missing search places provider key')
  }
}

function formatPlacesResult (result) {
  const displayName = result.display_name
  const displayNamePart1 = (result.display_name.split(',')[0] || '').trim()
  const displayNamePart2 = (result.display_name.split(',')[1] || '').trim()

  const postcode = get(result, 'address.postcode', '')
  let shortDisplayName = (get(result, 'address.village') || // TODO: move this string to i18n if it works properly
    get(result, 'address.town') ||
    get(result, 'address.city') ||
    get(result, 'address.county', `${displayNamePart1}${
      displayNamePart2 ? ', ' + displayNamePart2 : ''
    }`))

  shortDisplayName += (postcode ? `, ${postcode}` : '')

  return {
    id: result.place_id,
    osmType: result.osm_type,
    osmId: result.osm_id,
    boundingbox: result.boundingbox,
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    shortDisplayName,
    displayName,
    postcode,
    type: result.type,
    importance: result.importance,
    address: result.address
  }
}
