/**
 * Customizer to be used with Lodash.mergeWith (https://lodash.com/docs/4.17.11#mergeWith)
 * or Lodash.assignWith.
 * @param {any} objValue - target object
 * @param {any} srcValue - candidate value from sources
 */
export function mergeOrOverwriteAndIgnoreNull (objValue, srcValue) {
  // replace the old array by the new array instead of default Lodash merge behaviour:
  // old: [1, 2, 3], new: [4, 5] => [4, 5, 3]
  if (Array.isArray(objValue)) return srcValue
  // Null values don’t overwrite target object values
  if (srcValue === null) return objValue
}
