import axios from 'axios'
import { uniqBy, get } from 'lodash'

const defaultPlacesApi = 'nominatim'
const placesApi = process.env.VUE_APP_PLACES_API || defaultPlacesApi

const nominatimHost = process.env.VUE_APP_NOMINATIM_HOST
const nominatimKey = process.env.VUE_APP_NOMINATIM_KEY

const geoapifyHost = 'https://api.geoapify.com'
const geoapifyKey = process.env.VUE_APP_GEOAPIFY_KEY

// API: https://developer.mapquest.com/documentation/open/nominatim-search/search/

export const isPlaceSearchEnabled = (() => {
  let enabled = true
  try {
    checkProviderInfo()
  } catch (err) {
    enabled = false
  }
  return enabled
})()

export async function search (query, { country } = {}) {
  if (placesApi === 'nominatim') {
    return searchWithNominatim(query, { country })
  } else if (placesApi === 'geoapify') {
    return searchWithGeoapify(query, { country })
  }

  throw new Error('Unknown place search provider')
}

export async function searchWithNominatim (query, { country } = {}) {
  checkProviderInfo()

  const encodedQuery = encodeURIComponent(query)
  const formattedCountries = formatCountries(country)

  const url = nominatimHost +
    '/nominatim/v1/search.php' +
    `?key=${nominatimKey}` +
    '&format=json' +
    '&q=' + encodedQuery +
    '&addressdetails=1' +
    (formattedCountries ? '&countrycodes=' + formattedCountries : '')

  let headers
  // add the accept-language into header for localization (only in browser environment)
  const browserLanguage = getBrowserLanguage()
  if (browserLanguage) {
    headers = {
      'accept-language': browserLanguage,
    }
  }

  const { data: results } = await axios.get(url, { headers })

  const uniqueResults = uniqBy(results, result => result.display_name)

  return uniqueResults.map(formatNominatimPlacesResult)
}

export async function searchWithGeoapify (query, { country } = {}) {
  checkProviderInfo()

  const encodedQuery = encodeURIComponent(query)
  const formattedCountries = formatCountries(country)

  // See documentation: https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/#api

  // add the language localization (only in browser environment)
  const browserLanguage = getBrowserISOLanguage()

  const urlParams = [
    `apiKey=${geoapifyKey}`,
    `text=${encodedQuery}`,
    'format=json',
    formattedCountries ? `filter=countrycode:${formattedCountries}` : '',
    browserLanguage ? `lang=${browserLanguage}` : '',
  ]

  const url = [
    geoapifyHost,
    '/v1/geocode/autocomplete',
    `?${urlParams.filter(Boolean).join('&')}`,
  ].join('')

  const { data: { results } } = await axios.get(url)

  const uniqueResults = uniqBy(results, result => result.place_id)
  return uniqueResults.map(formatGeoapifyPlacesResult)
}

function formatCountries (country) {
  if (!country) return null
  if (Array.isArray(country)) return country.join(',')
  return country
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
  if (placesApi === 'nominatim') {
    if (!nominatimHost) throw new Error('Missing place search provider Nominatim host')
    if (!nominatimKey) throw new Error('Missing place search provider Nominatim key')
  } else if (placesApi === 'geoapify') {
    if (!geoapifyKey) throw new Error('Missing place search provider Geoapify key')
  } else {
    throw new Error('Missing place search search provider info')
  }
}

function formatNominatimPlacesResult (result) {
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

function formatGeoapifyPlacesResult (result) {
  const displayName = result.formatted
  const postcode = result.postcode || ''

  let shortDisplayName
  if (['street', 'building'].includes(result.result_type)) {
    shortDisplayName = `${result.street}, ${result.city}${postcode ? `, ${postcode}` : ''}`
  } else if (result.name) {
    shortDisplayName = result.name
  } else {
    shortDisplayName = result.city
  }

  return {
    id: result.place_id,
    osmType: '',
    osmId: '',
    boundingbox: result.bbox,
    latitude: result.lat,
    longitude: result.lon,
    shortDisplayName,
    displayName,
    postcode,
    type: result.result_type,
    importance: result.rank.importance,
    address: {
      village: '',
      town: '',
      city: result.city,
      county: result.county,
    },
  }
}

function getBrowserLanguage () {
  if (typeof window !== 'object') return null

  return (window.navigator.languages && window.navigator.languages.join(',')) ||
    window.navigator.language ||
    window.navigator.userLanguage
}

function getBrowserISOLanguage () {
  if (typeof window !== 'object') return null

  const language = (window.navigator.languages && window.navigator.languages[0]) ||
    window.navigator.language ||
    window.navigator.userLanguage

  return language.split('-')[0]
}
