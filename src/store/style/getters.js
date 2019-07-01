export function baseImageRatio (state) {
  return state.baseImageAspectRatioHeight
    ? state.baseImageAspectRatioWidth / state.baseImageAspectRatioHeight : 3 / 2
}
