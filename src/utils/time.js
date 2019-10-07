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

export function convertEndDateFromAPIToUI (endDate, { startDate, timeUnit = 'd', includeEndDate = true } = {}) {
  if (!includeEndDate) return endDate

  const quasarTimeUnit = getQuasarTimeUnit(timeUnit)

  if (!endDate) return endDate
  const newEndDate = addToDate(new Date(endDate).toISOString(), { [quasarTimeUnit]: -1 }).toISOString()

  // align the offset to start date to avoid non-integer duration
  const differenceOffset = getOffsetDifference(startDate, newEndDate)
  if (differenceOffset) {
    return addToDate(newEndDate, { minutes: differenceOffset }).toISOString()
  } else {
    return newEndDate
  }
}

export function convertEndDateFromUIToAPI (endDate, { startDate, timeUnit = 'd', includeEndDate = true } = {}) {
  if (!includeEndDate) return endDate

  const quasarTimeUnit = getQuasarTimeUnit(timeUnit)

  if (!endDate) return endDate
  const newEndDate = addToDate(new Date(endDate).toISOString(), { [quasarTimeUnit]: 1 }).toISOString()

  // align the offset to start date to avoid non-integer duration
  const differenceOffset = getOffsetDifference(startDate, newEndDate)
  if (differenceOffset) {
    return addToDate(newEndDate, { minutes: -differenceOffset }).toISOString()
  } else {
    return newEndDate
  }
}

export function getOffsetDifference (startDate, endDate) {
  const endDateOffset = new Date(endDate).getTimezoneOffset()
  const startDateOffset = startDate ? new Date(startDate).getTimezoneOffset() : endDateOffset
  return endDateOffset - startDateOffset
}
