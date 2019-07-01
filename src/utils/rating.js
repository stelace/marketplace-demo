import { isNumber } from 'lodash'

const apiMaxScore = 100

export function convertDisplayToApiScore (displayScore, { displayMaxScore = apiMaxScore }) {
  if (!isNumber(displayScore)) return displayScore

  return Math.round(displayScore * apiMaxScore / displayMaxScore)
}

export function convertApiToDisplayScore (apiScore, { displayMaxScore = apiMaxScore, nbDecimals = 1 } = {}) {
  if (!isNumber(apiScore)) return apiScore

  const displayScore = apiScore * displayMaxScore / apiMaxScore

  // get the right number of decimals
  const divider = Math.pow(10, nbDecimals)
  return Math.round(displayScore * divider) / divider
}

export function isRatingOptional (ratingConfig) {
  return !!(ratingConfig.form === 'boolean' &&
    ratingConfig.choices &&
    ratingConfig.choices.length === 1)
}
