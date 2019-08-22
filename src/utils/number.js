/**
 * Rounds any number in (1,10] to 10, in (10, 100] to 100, in (100, 1000] to 1000 and so on.
 * @param {Number} x
 */
export function roundUpPower10 (x) {
  if (isNaN(x)) throw new Error('Number expected')
  return Math.pow(10, Math.ceil(Math.log10(x)))
}
