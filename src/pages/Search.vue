<template>
  <q-page class="row items-stretch">
    <div :class="['col-12 q-pa-md', isSearchMapVisible ? 'col-md-8' : '']">
      <div class="row q-col-gutter-md items-start">
        <AssetCard
          v-for="asset of searchedAssets"
          :key="asset.id"
          :class="[
            'col-12 col-sm-6 col-md-4 col-lg-3',
            isSearchMapVisible ? 'col-xl-3' : 'col-xl-2'
          ]"
          :asset="asset"
          @mouseenter.native="animateMarker(asset.id)"
          @mouseleave.native="animateMarker(asset.id, false)"
        />
      </div>
      <div class="row justify-center q-mt-md">
        <QPagination
          v-show="searchedAssets.length && search.paginationMeta.nbPages > 1"
          :value="search.searchFilters.page"
          :max="search.paginationMeta.nbPages"
          :max-pages="5"
          color="grey"
          direction-links
          @input="changePage"
        />
      </div>
    </div>
    <!-- Rebuilding the map with v-if for appropriate sizing
    https://github.com/mapbox/mapbox-gl-js/issues/3265 -->
    <QPageSticky
      v-if="mapSized || isSearchMapVisible"
      v-show="isSearchMapVisible"
      class="gt-sm col-md-4 full-height"
      position="top-right"
    >
      <QNoSsr>
        <AppMap
          class="absolute-full"
          :nav-control="{ show: true, position: 'top-left' }"
          @map-resize="mapResized"
          @map-load="mapLoaded"
          @map-movestart="mapMoveStarted"
          @map-moveend="mapMoveEnded"
        />

        <QBtn
          v-if="searchAfterMapMoveActive"
          v-show="!showRetriggerSearchLabel"
          class="map-search-on-map-move bg-white q-py-sm"
          size="sm"
          @click="toggleSearchAfterMapMove"
        >
          <QCheckbox
            :value="shouldSearchAfterMapMove"
            dense
            @input="toggleSearchAfterMapMove"
          />

          <AppContent
            class="q-ml-sm"
            entry="pages"
            field="search.search_after_map_move"
          />
        </QBtn>
        <QBtn
          v-if="searchAfterMapMoveActive"
          v-show="showRetriggerSearchLabel"
          color="secondary"
          class="map-search-on-map-move q-py-sm"
          size="sm"
          @click="triggerSearchWithMapCenter"
        >
          <AppContent
            v-show="showRetriggerSearchLabel"
            entry="pages"
            field="search.redo_search"
          />
        </QBtn>
      </QNoSsr>
    </QPageSticky>
  </q-page>
</template>

<script>
/* global mapboxgl */
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import { get, set } from 'lodash'
import getDistance from 'geolib/es/getDistance'
import pMap from 'p-map'

import AssetCard from 'src/components/AssetCard'

import PageComponentMixin from 'src/mixins/pageComponent'

export default {
  components: {
    AppMap: () => import(/* webpackChunkName: 'mapbox' */ 'mapbox-gl')
      .then(mapbox => {
        if (window && !window.mapboxgl) window.mapboxgl = mapbox.default
        return import(/* webpackChunkName: 'mapbox' */ 'src/components/AppMap')
      }),
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      // map: null, // DON’T keep map object in Vue, this BREAKS the map (probably reactivity)
      mapSized: false,
      populatedMapMarkers: { // Keep track of generated popup contents.
        // assetId: markerDOMElement // to clean up before destroy
      },
      shouldSearchAfterMapMove: true,
      mapCenterChanged: false,
      mapMovingProgrammatically: false,
      mapCenterGps: {
        latitude: 0, // will be set after map initialization
        longitude: 0,
      },
      mapMaxDistance: null,
      mapFitBoundsActive: true,
      mapFitBoundsTimeout: null,
    }
  },
  computed: {
    ...mapState([
      'search',
      'common'
    ]),
    ...mapGetters([
      'getBaseImageUrl',
      'searchedAssets',
      'isSearchMapVisible',
      'defaultSearchMode',
      'searchAfterMapMoveActive',
    ]),
    showRetriggerSearchLabel () {
      if (this.shouldSearchAfterMapMove) return false
      return this.mapCenterChanged
    },
  },
  watch: {
    'search.assets' () {
      this.refreshMap()
    },
    isSearchMapVisible (visible) {
      if (!visible) {
        this.destroyMarkers()
        this.map = null
      }
    }
  },
  beforeMount () {
    if (this.$q.screen.gt.sm) this.$store.commit(mutationTypes.TOGGLE_SEARCH_MAP, { visible: true })

    // keeping track of generated markers, use assetIds as keys
    // We need full mapbox objects, stored outside of vue (reactivity not needed, and even full of bugs)
    window.stlMapMarkers = {}
  },
  async preFetch ({ store }) {
    await Promise.all([
      store.dispatch('fetchConfig'),
      store.dispatch('fetchAssetsRelatedResources'),
    ])

    // search results in server-side for SEO
    if (!store.state.search.searchMode) {
      await store.dispatch('selectSearchMode', { searchMode: store.getters.defaultSearchMode })
    }

    await store.dispatch('searchAssets')
  },
  beforeDestroy () {
    this.$store.commit(mutationTypes.TOGGLE_FILTER_DIALOG, { visible: false })

    this.destroyMarkers()
    delete window.stlMapMarkers

    clearTimeout(this.mapFitBoundsTimeout)
  },
  methods: {
    async afterAuth () {
      // refresh search results based on current user default search mode
      if (!this.search.searchMode) {
        await this.$store.dispatch('selectSearchMode', { searchMode: this.defaultSearchMode })
      }

      await this.$store.dispatch('searchAssets')
    },
    mapResized () {
      this.mapSized = true
    },
    async changePage (page) {
      this.$store.commit({
        type: mutationTypes.SEARCH__SET_SEARCH_FILTERS,
        page
      })

      await this.searchAssets({ resetPagination: false })
    },
    async searchAssets ({ resetPagination } = {}) {
      await this.$store.dispatch('searchAssets', { resetPagination })
    },
    getMapFeatures () {
      return this.searchedAssets.filter(a => a.locations.length).map(a => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [a.locations[0].longitude, a.locations[0].latitude]
        },
        properties: {
          assetId: a.id
        }
      }))
    },
    mapLoaded (map) {
      this.map = map // raw mapbox object
      this.refreshMap()
    },
    refreshMap () {
      if (!this.map || !this.isSearchMapVisible) return

      const mapFeatures = this.getMapFeatures()
      this.destroyMarkers({ keep: this.searchedAssets.map(a => a.id) })

      if (!mapFeatures.length) {
        this.mapFitBoundsActive = true
        return
      }

      if (this.mapFitBoundsActive) {
        this.mapMovingProgrammatically = true

        const firstCoordinates = mapFeatures[0].geometry.coordinates

        // Pass the first coordinates & wrap each coordinate pair in `extend` to include them in the bounds result.
        // A variation of this technique could be applied to zooming to the bounds of multiple Points or Polygon geomteries
        // - it just requires wrapping all the coordinates with the extend method.
        const bounds = mapFeatures.reduce(function (bounds, f) {
          return bounds.extend(f.geometry.coordinates)
        }, new mapboxgl.LngLatBounds(firstCoordinates, firstCoordinates))

        const fitBoundsDuration = 2000
        this.map.fitBounds(bounds, {
          padding: 50,
          duration: fitBoundsDuration
        })
        this.mapFitBoundsTimeout = setTimeout(() => {
          this.mapMovingProgrammatically = false
          this.mapFitBoundsActive = true
        }, fitBoundsDuration)
      } else {
        this.mapFitBoundsActive = true
      }

      // add new markers to map
      pMap(mapFeatures, async f => {
        const assetId = f.properties.assetId
        const asset = this.searchedAssets.find(a => a.id === assetId)
        const markerId = `marker-${assetId}`
        const imgSrc = this.getBaseImageUrl(asset)

        if (!imgSrc) return

        let el = document.createElement('div')
        el.id = markerId
        el.className = 'stl-map-marker'
        el.style.backgroundImage = `url("${imgSrc}")`

        let marker = get(window.stlMapMarkers, assetId)

        if (!marker) {
          const popupId = `map-popup-${assetId}`
          const popup = new mapboxgl.Popup({
            closeButton: false,
            className: 'stl-map-search-popup'
          }).setHTML(`<div id="${popupId}"></div>`)

          // Use render function to spare vue compiler
          const PopupContent = Vue.extend({
            components: { AssetCard },
            router: this.$router,
            store: this.$store,
            render: h => h(AssetCard, {
              props: { asset },
              attrs: { id: popupId },
            })
          })

          marker = new mapboxgl.Marker(el)
            .setLngLat(f.geometry.coordinates)
            .addTo(this.map)
            .setPopup(popup)

          set(window.stlMapMarkers, assetId, marker)

          popup.on('open', async () => {
            // Mount PopupContent once
            const isPopupEmpty = !this.populatedMapMarkers[assetId]

            if (isPopupEmpty) {
              // can only mount Vue component once mapbox injects popup in DOM
              new PopupContent().$mount(`#${popupId}`)
              this.populatedMapMarkers[assetId] = document.getElementById(markerId)
              // Hack to force appropriate initial positionning
              marker.togglePopup()
              marker.togglePopup()
            }

            this.populatedMapMarkers[assetId].style.display = 'none'
          })
          popup.on('close', () => {
            // all popups (even empty ones) get closed when markers are destroyed
            if (this.populatedMapMarkers[assetId]) this.populatedMapMarkers[assetId].style.display = ''
          })
        }
      }, { concurrency: 2 }) // pMap
    },
    destroyMarkers ({ keep } = {}) {
      // Don’t keep all markers in memory when results change
      const assetMarkersToKeep = keep || []
      Object.keys(window.stlMapMarkers).forEach(assetId => {
        if (!assetMarkersToKeep.includes(assetId)) {
          window.stlMapMarkers[assetId].remove()
          // Mapbox marker.remove destroys attached listeners and popups internally
          delete window.stlMapMarkers[assetId]
          delete this.populatedMapMarkers[assetId]
        }
      })
    },
    animateMarker (assetId, animate = true) {
      const marker = get(window.stlMapMarkers, assetId)
      const el = marker && marker.getElement()

      if (!el) return

      if (animate) el.classList.add('stl-map-marker--bounce')
      else el.classList.remove('stl-map-marker--bounce')
    },
    mapMoveStarted (map) {
      if (!this.searchAfterMapMoveActive || this.mapMovingProgrammatically) return

      this.mapCenterChanged = true
    },
    mapMoveEnded (map) {
      if (!this.searchAfterMapMoveActive) return
      if (this.mapMovingProgrammatically || !this.mapCenterChanged) return

      const rawCenter = map.getCenter()

      this.mapCenterGps = {
        latitude: rawCenter.lat,
        longitude: rawCenter.lng
      }

      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      this.mapMaxDistance = Math.round(
        getDistance(
          { latitude: sw.lat, longitude: sw.lng },
          { latitude: ne.lat, longitude: ne.lng },
        ) / 2
      )

      if (this.shouldSearchAfterMapMove) {
        this.triggerSearchWithMapCenter()
      }
    },
    toggleSearchAfterMapMove () {
      this.shouldSearchAfterMapMove = !this.shouldSearchAfterMapMove
    },
    async triggerSearchWithMapCenter () {
      clearTimeout(this.mapFitBoundsTimeout)

      this.$store.commit({
        type: mutationTypes.SEARCH__SET_MAP_OPTIONS,
        useMapCenter: true,
        maxDistance: this.mapMaxDistance,
        latitude: this.mapCenterGps.latitude,
        longitude: this.mapCenterGps.longitude,
      })

      this.mapFitBoundsActive = false

      try {
        await this.searchAssets()
      } catch (err) {
        throw err
      } finally {
        this.mapCenterChanged = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>

$stl-map-search-on-map-move-top = 10px
$stl-map-search-on-map-move-left = 50px

.map-search-on-map-move
  position: absolute
  top: $stl-map-search-on-map-move-top
  left: $stl-map-search-on-map-move-left
  z-index: 1

</style>
