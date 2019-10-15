import { date } from 'quasar'

const { addToDate } = date

export function isValidDateString (value) {
  try {
    const date = new Date(value) // eslint-disable-line no-new
    return !isNaN(date)
  } catch (err) {
    return false
  }
}

const mapQuasarTimeUnitToStelace = {
  m: 'minutes',
  h: 'hours',
  d: 'days',
  M: 'months'
}

function getQuasarTimeUnit (timeUnit) {
  return mapQuasarTimeUnitToStelace[timeUnit]
}

/**
 * This function operates date manipulation on `endDate`, especially useful for one time unit length transactions
 * e.g. one-day transaction on '2019-01-01' with `startDate` and `endDate` at '2019-01-01T00:00:00.000Z' from calendar
 * it will transform `endDate` into '2019-01-02T00:00:00.000Z' if target equals to 'api'
 * @param {String}  endDate
 * @param {Object}  [options]
 * @param {String}  [options.timeUnit = 'd'] - allowed values: `M`, `d`, `h`, `m` for months, days, hours and minutes
 * @param {Boolean} [options.includeEndDate = true] - if true, an additional time unit will be added to `endDate`
 * @param {String}  options.target - specify the conversion direction (from ui to api, or inversely)
 */
export function convertEndDate (endDate, { timeUnit = 'd', includeEndDate = true, target } = {}) {
  const allowedTargets = ['api', 'ui']
  if (!allowedTargets.includes(target)) throw new Error(`Invalid target: ${allowedTargets.join(', ')} expected`)

  if (!includeEndDate) return endDate

  const quasarTimeUnit = getQuasarTimeUnit(timeUnit)

  if (!endDate) return endDate
  const newEndDate = addToDate(
    new Date(endDate).toISOString(),
    { [quasarTimeUnit]: target === 'ui' ? -1 : 1 }
  ).toISOString()
  return newEndDate
}
