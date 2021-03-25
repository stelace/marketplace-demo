<template>
  <q-select
    ref="select"
    class="stl-places-autocomplete"
    :value="location"
    v-bind="$attrs"
    :options="places"
    :option-value="place => place && place.id"
    :option-label="place => place && place.shortDisplayName"
    :use-input="!(hideInputOnSelect && location)"
    :loading="loading"
    @filter="fetchPlaces"
    @input="selectPlace"
    @keyup.down.native="focusChanged"
    @keyup.up.native="focusChanged"
    @keyup.enter.native="onEnter"
  >
    <template #option="scope">
      <QItem
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
      >
        <QItemSection>
          <QItem-label>{{ scope.opt.shortDisplayName }}</QItem-label>
          <QItem-label caption>
            {{ scope.opt.displayName }}
          </QItem-label>
        </QItemSection>
      </QItem>
    </template>

    <template
      v-if="
        (showSearchIcon && searchIconPosition === 'left')
          || padLeft
      "
      #prepend
    >
      <template v-if="showSearchIcon && searchIconPosition === 'left'">
        <QIcon
          v-show="!showPromptPositionButton"
          :color="iconColor"
          :name="icons.matPlace"
        />
        <QBtn
          v-show="showPromptPositionButton"
          class="cursor-pointer"
          :icon="icons.matMyLocation"
          dense
          @click="triggerPromptCurrentPosition"
        />
      </template>
    </template>

    <template #append>
      <QBtn
        v-if="location !== null"
        :icon="icons.matClear"
        rounded
        dense
        flat
        @click.stop="selectPlace(null)"
      />

      <QIcon
        v-if="showSearchIcon && !showPromptPositionButton && searchIconPosition === 'right'"
        v-show="location === null"
        :color="iconColor"
        :name="icons.matPlace"
      />
      <QBtn
        v-show="showPromptPositionButton && searchIconPosition === 'right'"
        class="cursor-pointer"
        :icon="icons.matMyLocation"
        dense
        @click="triggerPromptCurrentPosition"
      />
    </template>

    <template #no-option>
      <QItem>
        <QItemSection class="text-grey">
          {{ $t({ id: 'status.no_results' }) }}
        </QItemSection>
      </QItem>
    </template>
  </q-select>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { matClear, matMyLocation, matPlace } from '@quasar/extras/material-icons'

import { search } from 'src/utils/places'

import GeolocationMixin from 'src/mixins/geolocation'

export default {
  mixins: [
    GeolocationMixin,
  ],
  props: {
    readSearchStore: {
      type: Boolean,
      default: false
    },
    showSearchIcon: {
      type: Boolean,
      default: true
    },
    padLeft: { // keep some spacing when showSearchIcon is false
      type: Boolean,
      default: false
    },
    promptCurrentPosition: {
      type: Boolean,
      default: false
    },
    searchIconPosition: {
      type: String,
      validator: value => ['left', 'right'].includes(value),
      default: 'right'
    },
    iconColor: {
      type: String,
      default: undefined
    },
    initialQuery: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    hideInputOnSelect: { // useful when line wrap should not happen
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      places: [],
      optionFocused: -1,
      selectedPlace: null,
      loading: false,
    }
  },
  computed: {
    location () {
      if (!this.readSearchStore && this.selectedPlace) return this.selectedPlace

      const query = this.readSearchStore
        ? (this.initialQuery || this.search.queryLocation)
        : this.initialQuery
      return (query && typeof query === 'string') ? { shortDisplayName: query } : null
    },
    searchCountry () {
      return this.country || this.assetsInUniqueCountry
    },
    optionIndex () {
      if (!this.$refs.select) return -1 // before rendering

      return this.$refs.select.optionIndex
    },
    showPromptPositionButton () {
      return this.displayAssetDistance &&
        this.promptCurrentPosition &&
        !this.currentUserPosition &&
        this.geolocationSupported
    },
    ...mapState([
      'search'
    ]),
    ...mapGetters([
      'assetsInUniqueCountry',
      'currentUserPosition',
      'displayAssetDistance',
    ])
  },
  created () {
    this.icons = {
      matClear,
      matMyLocation,
      matPlace
    }
  },
  methods: {
    fetchPlaces (query, update, abort) {
      if (query.length < 2) {
        abort()
        return
      }

      update(async () => {
        this.showLoadingSpinner()

        if (!query) {
          this.places = []
        } else {
          let places = await search(query, { country: this.searchCountry })
          places = places.slice(0, 5)

          this.places = places
        }

        this.hideLoadingSpinner()
      })
    },
    selectPlace (place) {
      this.selectedPlace = place
      this.$emit('selectPlace', place)
    },
    onEnter () {
      this.selectPlace(this.optionFocused > 0 ? this.places[this.optionFocused] : this.places[0])
      // Keep optionFocused value in case Enter key is press again
    },
    focusChanged () { // TODO: submit a PR to quasar to expose focus or a method to get it like setOptionIndex
      // https://github.com/quasarframework/quasar/blob/v1.0.0-beta.6/quasar/src/components/select/QSelect.js#L297
      this.optionFocused = this.optionIndex
    },
    showLoadingSpinner (timeout = 100) {
      this.loadingTimeout = setTimeout(() => {
        this.loading = true
      }, timeout)
    },
    hideLoadingSpinner () {
      this.loading = false
      clearTimeout(this.loadingTimeout)
    },
    async triggerPromptCurrentPosition () {
      try {
        await this.getUserGeolocation()

        const currentPosition = {
          displayName: this.$t({ id: 'places.current_position' }),
          shortDisplayName: this.$t({ id: 'places.current_position' }),
          latitude: this.currentUserPosition.latitude,
          longitude: this.currentUserPosition.longitude
        }

        this.selectPlace(currentPosition)
      } catch (err) {
        // handled by `this.getUserGeolocation()`
        // `catch` statement still needed because the function `triggerPromptCurrentPosition` is
        // directly used in template
      }
    }
  }
}

</script>

<style lang="stylus">
.stl-places-autocomplete
  .q-select__dropdown-icon
    display: none
</style>
