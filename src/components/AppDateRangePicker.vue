<script>
import { date } from 'quasar'
import { pickBy, mapKeys } from 'lodash'

import DatePickerInput from 'src/components/DatePickerInput'

const start = 'start-date-'
const end = 'end-date-'

export default {
  components: {
    DatePickerInput,
  },
  props: {
    containerClass: {
      type: String,
      default: ''
    },
    columnClass: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    missingEndDateMeaning: { // 'end-date-required' takes precedence over this
      type: String,
      default: ''
    },
    getValidStartDates: {
      type: Function,
      default: undefined
    },
    getValidEndDates: {
      type: Function,
      default: undefined
    },
    hideCalendarIcon: {
      type: Boolean,
      default: false
    },
    hideCloseIcon: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    localizedDate () {
      if (!this.date) return ''
      return this.$t({ id: 'time.date_short' }, { date: new Date(this.date) })
    },
    datePickerDate () {
      if (!this.date) return null
      return date.formatDate(this.date, 'YYYY/MM/DD')
    },
    // All $attrs are propagated to both inputs except for those starting with (start|end)-date- prefix
    startDateInputAttrs () {
      return mapKeys(pickBy(this.$attrs, (v, k) => !k.startsWith(end)), (v, k) => k.replace(start, ''))
    },
    endDateInputAttrs () {
      return mapKeys(pickBy(this.$attrs, (v, k) => !k.startsWith(start)), (v, k) => k.replace(end, ''))
    },
    missingStartDateHint () {
      return typeof this.$attrs['start-date-required'] === 'string'
        ? this.$t({ id: 'form.error.missing_field' }) : ''
    },
    missingEndDateHint () {
      if (typeof this.$attrs['end-date-required'] === 'string') {
        return this.$t({ id: 'form.error.missing_field' })
      } else if (this.missingEndDateMeaning) {
        return this.missingEndDateMeaning
      } else return ''
    }
  },
  methods: {
    selectStartDate (date) {
      this.$emit('changeStartDate', date)
    },
    selectEndDate (date) {
      this.$emit('changeEndDate', date)
    },
    forceEndDateAfterStartDate (date) {
      return new Date(date).toISOString() >= this.startDate
    },
  }
}

</script>

<template>
  <div :class="['row', containerClass || 'justify-around']">
    <div :class="[columnClass || 'col-12 col-sm-5']">
      <DatePickerInput
        :date="startDate"
        :label="$t({ id: 'time.start_date_label' })"
        :hint="!startDate ? missingStartDateHint : ''"
        v-bind="startDateInputAttrs"
        :get-valid-dates="getValidStartDates"
        :hide-calendar-icon="hideCalendarIcon"
        :hide-close-icon="hideCloseIcon"
        @change="selectStartDate"
      />
    </div>
    <div :class="[columnClass || 'col-12 col-sm-5']">
      <DatePickerInput
        :date="endDate"
        :label="$t({ id: 'time.end_date_label' })"
        :hint="!endDate ? missingEndDateHint : ''"
        :get-valid-dates="getValidEndDates || forceEndDateAfterStartDate"
        :disabled="!startDate"
        :hide-calendar-icon="hideCalendarIcon"
        :hide-close-icon="hideCloseIcon"
        v-bind="endDateInputAttrs"
        @change="selectEndDate"
      />
    </div>
  </div>
</template>

<style lang="stylus" scoped>

</style>
