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

export function convertEndDate (endDate, { timeUnit = 'd', includeEndDate = true, target } = {}) {
  const allowedTarget = ['api', 'ui']
  if (!allowedTarget.includes(target)) throw new Error(`Invalid type: ${allowedTarget.join(', ')} expected`)

  if (!includeEndDate) return endDate

  const quasarTimeUnit = getQuasarTimeUnit(timeUnit)

  if (!endDate) return endDate
  const newEndDate = addToDate(
    new Date(endDate).toISOString(),
    { [quasarTimeUnit]: target === 'ui' ? -1 : 1 }
  ).toISOString()
  return newEndDate
}
