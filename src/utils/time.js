export function isValidDateString (value) {
  try {
    const date = new Date(value) // eslint-disable-line no-new
    return !isNaN(date)
  } catch (err) {
    return false
  }
}
