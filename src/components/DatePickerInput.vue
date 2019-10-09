<template>
  <QInput
    class="stl-datepicker-input"
    :value="localizedDate"
    :readonly="$attrs.disabled || $attrs.readOnly /* disabled is not enough to prevent input here */"
    v-bind="$attrs"
    input-class="cursor-pointer"
    @click.native.stop="!$attrs.disabled && $refs.datePopup && $refs.datePopup.show()"
  >
    <template v-slot:prepend>
      <QBtn
        v-if="calendarIconPosition === 'left' && !hideCalendarIcon"
        :aria-label="$t({ id: 'form.date_placeholder' })"
        :color="iconColor"
        :disabled="$attrs.disabled"
        icon="event"
        rounded
        dense
        flat
      >
        <QPopupProxy ref="datePopup">
          <QDate
            :value="datePickerDate"
            :options="getValidDates"
            @input="selectDate"
          />
        </QPopupProxy>
      </QBtn>
    </template>

    <template v-slot:append>
      <QBtn
        v-if="calendarIconPosition === 'right' || hideCalendarIcon"
        :class="[hideCalendarIcon ? 'no-pointer-events' : '']"
        :aria-label="$t({ id: 'form.date_placeholder' })"
        :color="iconColor"
        :disabled="$attrs.disabled"
        rounded
        dense
        flat
      >
        <QPopupProxy ref="datePopup">
          <QDate
            :value="datePickerDate"
            :options="getValidDates"
            @input="selectDate"
          />
        </QPopupProxy>
      </QBtn>

      <QBtn
        v-show="date && !hideCloseIcon"
        :aria-label="$t({ id: 'prompt.reset_button' })"
        icon="close"
        rounded
        dense
        flat
        @click.stop="selectDate(null)"
      />
    </template>
  </QInput>
</template>

<script>
import { date } from 'quasar'

export default {
  props: {
    date: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: undefined
    },
    calendarIconPosition: {
      type: String,
      validator: value => ['left', 'right'].includes(value),
      default: 'right'
    },
    getValidDates: {
      type: Function,
      default: () => true // all dates are valid
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
    }
  },
  methods: {
    selectDate (date) {
      // date has the format YYYY/MM/DD which is parsed as local time via new Date().ISOString()
      // e.g. new Date('2019/01/01').toISOString() === '2018-12-31T23:00:00.000Z'

      // replace it by the format YYYY-MM-DD which is always parsed as UTC new Date().ISOString()
      // e.g. new Date('2019-01-01').toISOString() === '2019-01-01T00:00:00.000Z'
      this.$emit('change', date ? new Date(date.replace(/\//g, '-')).toISOString() : null)
      this.$refs.datePopup.hide()
    },
  }
}

</script>

<style lang="stylus" scoped>

</style>
