<script>
/**
 * This component should be used to retrieve numbers from user.
 * It fixes some browser inconsistencies:
 * - wrong value validated due use of `parseFloat`
 *   In IE11, the input type number is marked as supported but there are some parsing issues.
 *   https://caniuse.com/#feat=input-number
 *   '43ef123' is a valid number because it is parsed as `parseFloat('43ef123') === 43`
 *   and user can continue to hit characters while the value is obviously incorrect.
 *   The issue is still there in Edge: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/17313919/
 *
 *   In other browsers: it is considered to be `null` or is handled by input type number so letters cannot be typed,
 *   except for the letter 'e' we'll see below
 *
 * - prevent accepted value beginning by the letter 'e'
 *   Javascript allows scientific notation to manipulate big numbers like `1e4 === 10000`
 *   and even modern browsers accept it as correct value.
 *   However end users don't know this notation and this is confusing.
 *
 * Solution: prevent keypress event to be transmitted to QInput if the key isn't a number or a separator (comma, dot).
 */

import { omit } from 'lodash'

const numberStringRegex = /^\d+([,.]\d+)?$/

export default {
  props: {
    value: {
      type: [Number, String],
      default: null
    },
  },
  data () {
    return {
      sanitizedValue: this.sanitizeValue(this.value),
    }
  },
  computed: {
    filteredAttrs () {
      return omit(this.$attrs, ['value'])
    },
    filteredListeners () {
      return omit(this.$listeners, ['input'])
    },
  },
  methods: {
    sanitizeValue (value) {
      if (typeof value === 'string') {
        if (numberStringRegex.test(value)) return parseFloat(value.replace(/,/g, '.'))
        return null
      } else if (value === 'number') {
        if (isFinite(value)) return value
        else return null
      } else {
        return null
      }
    },
    changeValue (value) {
      const newSanitizedValue = this.sanitizeValue(value)
      this.sanitizedValue = newSanitizedValue

      // manually trigger validation with the new value
      this.$refs.inputEl.validate(newSanitizedValue)
      this.$emit('input', newSanitizedValue)
    },
    onKeypress (event) {
      const isNumber = c => /^\d$/.test(c)

      // accept comma and dot as number decimal separator as browsers may accept one or both
      // https://www.ctrl.blog/entry/html5-input-number-localization.html
      const isNumberSeparator = c => [',', '.'].includes(c) // accepts both separators (depends on browsers)

      // `event.char` is deprecated, however hitting the `.` in the numpad may return `event.key === 'Del'` for IE11
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
      const c = event.char || event.key

      // prevent unwanted characters to be displayed in the input field
      if (!isNumber(c) && !isNumberSeparator(c)) event.preventDefault()
    }
  },
}
</script>

<template>
  <QInput
    ref="inputEl"
    type="number"
    :value="sanitizedValue"
    v-bind="filteredAttrs"
    v-on="filteredListeners"
    @input="changeValue"
    @keypress="onKeypress($event)"
  />
</template>
