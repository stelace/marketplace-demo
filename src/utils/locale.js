export function getUserLocales () {
  if (typeof window !== 'object') return []
  return window.navigator.languages || [window.navigator.language || window.navigator.userLanguage]
}

export function parseLocale (locale) {
  const localeRegex = /([a-z]{2})(?:[_-]([a-z]{2}))?/i
  const regexResult = localeRegex.exec(locale)
  const language = regexResult[1]
  const region = regexResult[2]

  const result = {
    language: null,
    region: null,
  }

  if (language) {
    result.language = language.toLowerCase()
  }
  if (region) {
    result.region = region.toUpperCase()
  }

  return result
}
