import { createInstance } from 'stelace'

const apiBaseURL = process.env.STELACE_API_URL
const apiKey = process.env.STELACE_PUBLISHABLE_API_KEY

const apiVersion = '2019-05-20'

const MAX_RESULTS_PER_PAGE = 100 // cf. Stelace API reference for pagination details

if (!apiKey) throw new Error('Missing Stelace publishable API key')

const stelace = initStelaceSdk({ apiBaseURL, apiKey })

export default stelace

export { fetchAllResults, getStelaceEnv }

/**
 * Use this function to fetch all results, it will automatically go through the pagination results
 * @param {Function} fetchFn({ page, nbResultsPerPage, ...params }) - fetch results factory, should return a promise
 * @param {Object} [params]
 * @return {Object[]} allResults
 */
async function fetchAllResults (fetchFn, params = {}) {
  const nbResultsPerPage = MAX_RESULTS_PER_PAGE
  let page = 1
  let allResults = []
  let results

  do {
    const passedParameters = Object.assign({}, params, { page, nbResultsPerPage })
    results = await fetchFn(passedParameters)
    page += 1

    allResults = allResults.concat(results)
  } while (results.paginationMeta.nbPages > results.paginationMeta.page)

  return allResults
}

function getStelaceEnv () {
  return apiKey.includes('_live_') ? 'live' : 'test'
}

export function initStelaceSdk ({ apiBaseURL, apiKey }) {
  const stelace = createInstance({ apiKey, apiVersion })

  if (apiBaseURL) {
    const parsedUrl = new URL(apiBaseURL)

    const host = parsedUrl.hostname
    const port = parsedUrl.port
    const protocol = parsedUrl.protocol.slice(0, -1)

    stelace.setHost(host, port, protocol)
  }

  return stelace
}
