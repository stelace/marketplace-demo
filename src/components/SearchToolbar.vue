<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'
import { debounce, pickBy, values } from 'lodash'
import { date } from 'quasar'

import AppSVGActionButton from 'src/components/AppSVGActionButton'
import CustomAttributesEditor from 'src/components/CustomAttributesEditor'
import DateRangePicker from 'src/components/DateRangePicker'

export default {
  components: {
    AppSVGActionButton,
    CustomAttributesEditor,
    DateRangePicker,
  },
  data () {
    return {
      debounceSearchAssets: debounce(this.searchAssets, 500),
      selectedCustomAttributes: {},
    }
  },
  computed: {
    selectedSearchModeLabel () {
      if (!this.search.searchMode) {
        return ''
      }
      return this.$t({ id: `form.search.modes.${this.search.searchMode}` })
    },
    isSearch () {
      return this.route.name === 'search'
    },
    searchLocationName () {
      return this.search.queryLocation
    },
    showPriceRangeFilter () {
      return this.search.priceRange.min !== this.search.priceDefaultMin ||
        this.search.priceRange.max !== this.search.priceDefaultMax
    },
    showFilterDialog () {
      return this.search.showFilterDialog
    },
    datePickerDate () {
      if (!this.search.startDate) return null
      return date.formatDate(this.search.startDate, 'YYYY/MM/DD')
    },
    displayCustomAttributes () {
      return this.search.displayCustomAttributes
    },
    customAttributes () {
      const attrs = this.common.customAttributesById
      const activeNames = this.displayCustomAttributes

      return values(attrs).filter((ca) => activeNames.includes(ca.name))
    },
    nbActiveCustomAttributes () {
      const ca = this.search.searchFilters.customAttributesFilters
      return Object.keys(pickBy(ca)).length
    },
    displayStartDate () {
      if (!this.search.startDate) return
      return this.$t({ id: 'time.date_short' }, { date: new Date(this.search.startDate) })
    },
    displayEndDate () {
      if (!this.search.endDate) return
      return this.$t({ id: 'time.date_short' }, { date: new Date(this.search.endDate) })
    },
    ...mapState([
      'layout',
      'route',
      'search',
      'style',
      'common',
    ]),
    ...mapGetters([
      'isSearchMapVisible',
      'searchOptions',
      'searchModes'
    ])
  },
  methods: {
    toggleSearchMap (visible) {
      this.$store.commit(mutationTypes.TOGGLE_SEARCH_MAP, { visible, save: true })
    },
    toggleFilterDialog () {
      this.$store.commit(mutationTypes.TOGGLE_FILTER_DIALOG)
    },
    hideFilterDialog () {
      this.$store.commit(mutationTypes.HIDE_FILTER_DIALOG)
    },
    hideStartDatePopup () {
      this.$refs.startDatePopup.hide()
    },
    setDates ({ startDate, endDate }) {
      const dates = {}

      if (startDate || startDate === null) {
        dates.startDate = startDate ? new Date(startDate).toISOString() : null
      }
      if (endDate || endDate === null) {
        dates.endDate = endDate ? new Date(endDate).toISOString() : null
      }

      this.$store.commit({
        type: mutationTypes.SET_SEARCH_DATES,
        ...dates
      })

      this.hideStartDatePopup()

      this.searchAssets()
    },
    resetPriceRange () {
      this.setDisplayPriceRange()
      this.setPriceRange()
      this.searchAssets()
    },
    setDisplayPriceRange ({ min, max } = {}) {
      this.$store.commit(mutationTypes.SET_DISPLAY_PRICE_RANGE, {
        min: typeof min === 'number' ? min : this.search.priceDefaultMin,
        max: typeof max === 'number' ? max : this.search.priceDefaultMax
      })
    },
    setPriceRange () {
      this.$store.commit(mutationTypes.SET_PRICE_RANGE, {
        min: this.search.displayPriceRange.min,
        max: this.search.displayPriceRange.max
      })
    },
    selectSearchMode (searchMode) {
      if (searchMode === this.search.searchMode) return

      this.$store.dispatch('selectSearchMode', { searchMode })
      this.searchAssets()
    },
    changeCustomAttributes (customAttributes) {
      this.selectedCustomAttributes = customAttributes
    },
    resetCustomAttributes () {
      this.selectedCustomAttributes = {}
    },
    setCustomAttributes () {
      this.$store.commit(mutationTypes.SEARCH__SET_SEARCH_FILTERS, {
        customAttributesFilters: this.selectedCustomAttributes
      })
    },
    triggerSearch () {
      this.setPriceRange()
      this.setCustomAttributes()

      this.searchAssets()
    },
    async resetSearchLocation () {
      this.$store.commit({
        type: mutationTypes.UNSET_SEARCH_LOCATION
      })

      this.searchAssets()
    },
    async searchAssets () {
      if (this.isSearch) {
        await this.$store.dispatch('searchAssets')
      } else {
        this.$router.push({ name: 'search' })
      }
    }
  }
}
</script>

<template>
  <QToolbar
    v-if="isSearch && !layout.isMenuOpened"
    class="search-filters-toolbar text-weight-medium"
  >
    <QBtnDropdown
      v-if="searchModes.length > 1"
      class="q-ml-xs"
      :label="selectedSearchModeLabel"
      :rounded="style.roundedTheme"
      color="transparent"
      text-color="primary"
      icon="search"
      unelevated
      no-caps
      dense
    >
      <QList>
        <QItem
          v-for="mode in searchModes"
          :key="mode"
          v-close-popup
          clickable
          @click="selectSearchMode(mode)"
        >
          <QItemSection>
            <QItemLabel>
              <AppContent
                entry="form"
                :field="`search.modes.${mode}`"
              />
            </QItemLabel>
          </QItemSection>
        </QItem>
      </QList>
    </QBtnDropdown>

    <QChip
      v-show="displayStartDate"
      clickable
      outline
      :removable="!!search.startDate"
      :square="!style.roundedTheme"
      color="primary"
      @remove="setDates({ startDate: null, endDate: null })"
    >
      {{ displayStartDate || $t({ id: 'time.start_date_label' }) }}
      <QPopupProxy
        ref="startDatePopup"
        :offset="[0,8]"
      >
        <div>
          <QDate
            :value="datePickerDate"
            @input="startDate => setDates({ startDate })"
          />
        </div>
      </QPopupProxy>
    </QChip>

    <QIcon
      v-show="displayStartDate && displayEndDate"
      name="arrow_forward"
      color="default-color"
    />

    <QChip
      v-show="displayEndDate"
      clickable
      outline
      :removable="!!search.endDate"
      :square="!style.roundedTheme"
      color="primary"
      @remove="setDates({ endDate: null })"
    >
      {{ displayEndDate || $t({ id: 'time.end_date_label' }) }}
      <QPopupProxy
        ref="endDatePopup"
        :offset="[0,8]"
      >
        <QDate
          :value="datePickerDate"
          @input="endDate => setDates({ endDate })"
        />
      </QPopupProxy>
    </QChip>

    <QChip
      v-show="showPriceRangeFilter"
      clickable
      removable
      outline
      :square="!style.roundedTheme"
      color="primary"
      @remove="resetPriceRange()"
    >
      <AppContent
        entry="pricing"
        field="price_range_short"
        :options="{ lower_price: search.priceRange.min, upper_price: search.priceRange.max }"
      />
    </QChip>

    <QChip
      v-show="searchLocationName"
      clickable
      removable
      outline
      :square="!style.roundedTheme"
      color="primary"
      @remove="resetSearchLocation"
    >
      {{ searchLocationName }}
    </QChip>

    <QChip
      clickable
      outline
      :removable="nbActiveCustomAttributes > 0"
      :square="!style.roundedTheme"
      color="primary"
      @click="toggleFilterDialog"
      @remove="resetCustomAttributes(); triggerSearch()"
    >
      <AppContent
        entry="form"
        field="search.filters"
      />
      <QBadge
        v-show="nbActiveCustomAttributes"
        class="filter-count-badge q-ml-sm"
        color="primary"
      >
        {{ nbActiveCustomAttributes || '' }}
      </QBadge>
    </QChip>

    <QDialog
      :value="showFilterDialog"
      maximized
      transition-show="slide-left"
      transition-hide="slide-right"
      content-class="filter-dialog"
      @hide="hideFilterDialog"
    >
      <div class="row">
        <div class="dialog-filters col-12 col-md-8 bg-white q-pa-lg">
          <div class="row justify-between">
            <AppContent
              class="text-subtitle1"
              tag="div"
              entry="pricing"
              field="price_label"
            />
            <AppContent
              entry="pricing"
              field="price_range_short"
              :options="{
                lower_price: search.displayPriceRange.min,
                upper_price: search.displayPriceRange.max
              }"
            />
          </div>
          <QRange
            :value="search.displayPriceRange"
            :min="search.priceDefaultMin"
            :max="search.priceDefaultMax"
            :step="200"
            snap
            @input="setDisplayPriceRange"
          />

          <DateRangePicker
            class="q-my-lg"
            :start-date="search.startDate"
            :end-date="search.endDate"
            :missing-end-date-meaning="$t({ id: 'time.missing_end_date_meaning' })"
            bottom-slots
            @changeStartDate="startDate => setDates({ startDate })"
            @changeEndDate="endDate => setDates({ endDate })"
          />

          <div
            v-if="displayCustomAttributes.length"
            class="q-mt-md"
          >
            <AppContent
              class="text-subtitle1"
              tag="div"
              entry="form"
              field="search.features_label"
            />
            <CustomAttributesEditor
              :definitions="customAttributes"
              :values="search.searchFilters.customAttributesFilters"
              @change="changeCustomAttributes"
            />
          </div>

          <div class="row justify-end items-center q-mt-lg">
            <QBtn
              v-close-popup
              class="text-weight-medium q-mr-md"
              :label="$t({ id: 'navigation.close' })"
              :rounded="style.roundedTheme"
              color="primary"
              flat
              no-caps
            />

            <component
              :is="style.hasSVGActionButton ? 'AppSVGActionButton' : 'QBtn'"
              v-close-popup
              class="text-weight-medium'"
              :label="$t({ id: 'navigation.search' })"
              :to="{ name: 'search' }"
              :rounded="style.roundedTheme"
              color="secondary"
              size="lg"
              no-caps
              @click="triggerSearch"
            />
          </div>
        </div>
        <div
          v-close-popup
          class="gt-sm col-md-4 bg-transparent"
        />
      </div>
    </QDialog>

    <QSpace />

    <QToggle
      class="text-default-color gt-sm"
      :value="isSearchMapVisible"
      :label="$t({ id: 'pages.search.show_map' })"
      color="positive"
      checked-icon="check"
      unchecked-icon="close"
      left-label
      @input="toggleSearchMap"
    />
  </QToolbar>
</template>

<style lang="stylus" scoped>
.search-filters-toolbar
  border-top 1px solid #EEE

.dialog-filters
  max-height: 100%
  overflow: auto
</style>
