<script>
import { mapState, mapGetters } from 'vuex'
import { get, isString, isUndefined } from 'lodash'

import {
  matSearch
} from '@quasar/extras/material-icons'

import { isPlaceSearchEnabled } from 'src/utils/places'

import AppCarousel from 'src/components/AppCarousel'
import AppDateRangePicker from 'src/components/AppDateRangePicker'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'
import CategoryAutocomplete from 'src/components/CategoryAutocomplete'

import * as types from 'src/store/mutation-types'

import PageComponentMixin from 'src/mixins/pageComponent'
import StripeMixin from 'src/mixins/stripe'

export default {
  name: 'Home',
  components: {
    AppCarousel,
    AppDateRangePicker,
    PlacesAutocomplete,
    CategoryAutocomplete,
  },
  mixins: [
    PageComponentMixin,
    StripeMixin,
  ],
  data () {
    return {
      searchMode: 'default',
      location: null,
      selectedCategory: null,
      query: '',
      startDate: '',
      endDate: '',
      searchByCategory: process.env.VUE_APP_SEARCH_BY_CATEGORY === 'true',
      isPlaceSearchEnabled,
      lastAssetsPromise: null,
      assets: null,
      nbAssetsPerSlideDefault: 4,
      nbCarouselSlides: 4, // Can be less when there are few assets, set to 1 to disable

      blurredBackgroundSVG: '',
    }
  },
  computed: {
    showDates () {
      const hasDates = this.getSearchModeUI(this.searchMode).hasDates
      return (!this.searchModes.length || hasDates === null) ? true : hasDates
    },
    nbAssetsVisiblePerSlide () {
      const nbAssetsWithoutCarousel = this.$q.screen.gt.xs ? (this.$q.screen.lt.md ? 4 : 3) : 2
      return this.showCarousel ? this.nbAssetsPerSlideDefault : nbAssetsWithoutCarousel
    },
    showCarousel () {
      return this.$q.screen.gt.sm
    },
    videoUrl () {
      const config = this.config.stelace
      // Publicly accessible and embeddable video URL is expected
      // To test Vimeo you can use 'https://player.vimeo.com/video/112866269'
      // YouTube: 'https://www.youtube-nocookie.com/embed/eY1XtWyKlJA'
      return get(config, 'instant.videoUrl', '')
    },
    nonDefaultSearchModes () {
      return this.searchModes.filter(m => m !== 'default')
    },
    ...mapState({
      style: state => state.style,
      config: state => state.common.config,
      content: state => state.content,
      locale: state => state.content.locale || 'en',
      auth: state => state.auth,
    }),
    ...mapGetters([
      'currentUser',
      'defaultSearchMode',
      'getHomeHeroUrlTransformed',
      'getSearchModeUI',
      'searchModes',
    ]),
  },
  watch: {
    '$route' () {
      this.handleUrlRedirection(this.$route)
    }
  },
  async created () {
    this.lastAssetsPromise = this.$store.dispatch('fetchLastAssets', {
      nbResults: this.nbAssetsPerSlideDefault * this.nbCarouselSlides
    })

    this.icons = {
      matSearch,
    }

    this.blurredBackgroundSVG = (await import('!!html-loader!src/assets/home-blurred-background.svg')).default
  },
  async mounted () {
    if (window.__PRERENDER_INJECTED) document.dispatchEvent(new Event('prerender-ready'))
    this.assets = await this.lastAssetsPromise
  },
  methods: {
    async afterAuth () {
      const {
        'reset-password': resetPasswordToken,
        check,
        status,
        code,
        state,
      } = this.$route.query

      if (resetPasswordToken) {
        this.$store.commit({
          type: types.SET_RESET_PASSWORD_TOKEN,
          resetToken: resetPasswordToken
        })
        this.openAuthDialog({ persistent: true, formType: 'resetPassword' })
      } else {
        this.handleUrlRedirection(this.$route)
      }

      if (state === 'stripe_oauth') {
        // Stripe redirection is handled in Home component while the user is redirected to her profile
        // because OAuth redirection full-formed URIs must be specified in Stripe Dashboard
        // and there are no way to specify wildcard URIs
        await this.linkStripeAccountAfterOAuth()
      } else {
        if (check === 'email') {
          if (status === 'valid') {
            this.notifySuccess('authentication.email_check.success')
          } else if (status === 'alreadyChecked') {
            this.notifySuccess('authentication.email_check.already_checked')
          } else if (status === 'expired') {
            this.notifyWarning('authentication.email_check.link_expired')
          } else if (status === 'invalid') {
            this.notifyWarning('authentication.email_check.link_invalid')
          }

          // replace the URL so the message won't display at each page refresh
          this.removeQueryParams(['check', 'status', 'token'])
        } else if (code) {
          if (status === 'success') {
            this.$store.dispatch('getAuthTokensAndUser', { code })

            // replace the URL so getting auth tokens won't happen at each page refresh
            this.removeQueryParams(['status', 'code'])
            this.notifySuccess('authentication.log_in_success')
          } else {
            this.notifyWarning('error.unknown_happened_header')
          }

          // if existing, redirect to URL path stored before SSO authentication
          const ssoRedirectUrlPath = window.localStorage.getItem('ssoRedirectUrlPath')
          window.localStorage.removeItem('ssoRedirectUrlPath')

          const validSsoRedirectUrlPath = ssoRedirectUrlPath &&
            isString(ssoRedirectUrlPath) &&
            ssoRedirectUrlPath.startsWith('/')

          if (validSsoRedirectUrlPath) this.$router.push(ssoRedirectUrlPath)
        }
      }
    },
    removeQueryParams (queryParams) {
      const newQuery = Object.assign({}, this.$route.query)
      queryParams.forEach(param => {
        delete newQuery[param]
      })
      this.$router.replace({ query: newQuery })
    },
    selectPlace (place) {
      if (place) {
        this.$store.commit({
          type: types.SET_SEARCH_LOCATION,
          queryLocation: place.shortDisplayName,
          latitude: place.latitude,
          longitude: place.longitude
        })
      } else {
        this.$store.commit({
          type: types.UNSET_SEARCH_LOCATION
        })
      }
    },
    selectCategory (category) {
      this.selectedCategory = category
    },
    setDates ({ startDate, endDate }) {
      if (!isUndefined(startDate)) this.startDate = startDate
      if (!isUndefined(endDate)) this.endDate = endDate
    },
    handleUrlRedirection (route) {
      const routeQuery = route.query

      if (routeQuery.redirect) {
        if (this.currentUser.id) {
          this.$router.replace(routeQuery.redirect)
        } else {
          this.openAuthDialog()
        }
      }
    },
    async searchAssets () {
      if (this.searchByCategory && !this.query) {
        this.$store.commit({
          type: types.SEARCH__SET_SEARCH_FILTERS,
          filters: {
            categoryId: this.selectedCategory && this.selectedCategory.id
          }
        })
      } else {
        this.$store.commit({
          type: types.SET_SEARCH_QUERY,
          query: this.query
        })
      }

      this.$store.commit({
        type: types.SEARCH__SET_MAP_OPTIONS,
        useMapCenter: false,
        latitude: null,
        longitude: null
      })

      this.$store.commit({
        type: types.SET_SEARCH_DATES,
        startDate: this.startDate ? new Date(this.startDate).toISOString() : null,
        endDate: this.endDate ? new Date(this.endDate).toISOString() : null,
        reset: true
      })

      if (this.searchMode && this.searchMode !== 'default') {
        this.$store.dispatch('selectSearchMode', { searchMode: this.searchMode })
      }

      this.$router.push({ name: 'search' })
    },
  }
}
</script>

<template>
  <q-page>
    <section
      :class="[
        'hero text-center',
        (blurredBackgroundSVG || style.homeHeroUrl) && !style.homeHasLightBackground ? 'text-white' : ''
      ]"
    >
      <div class="hero__background absolute-full">
        <!-- Blurred SVG background when loading page and background image.
            SVG is permanently used on small screens for which no <picture> source is loaded.
            It is also a fallback for browsers not supporting <picture> (and object-fit) such as IE11 -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="blurred-svg-background" v-html="blurredBackgroundSVG" />
        <picture>
          <source
            type="image/webp"
            :srcset="`${
              getHomeHeroUrlTransformed({ width: 1024 })
            } 1024w, ${
              getHomeHeroUrlTransformed({ width: 1366 })
            } 1366w, ${
              getHomeHeroUrlTransformed({ width: 1600 })
            } 1600w, ${
              getHomeHeroUrlTransformed({ width: 1920 })
            } 1920w, ${
              getHomeHeroUrlTransformed({ width: 2560 })
            } 2560w`"
            sizes="100vw"
            media="(min-width: 640px)"
          >
          <!-- Handle browsers not supporting WebP, contrasting with prerendering env (Puppeter) -->
          <!-- TODO: remove WebP test when upgrading to AWS image handler version supporting AUTO_WEBP -->
          <source
            :srcset="`${
              getHomeHeroUrlTransformed({ noWebP: true, width: 1024 })
            } 1024w, ${
              getHomeHeroUrlTransformed({ noWebP: true, width: 1366 })
            } 1366w, ${
              getHomeHeroUrlTransformed({ noWebP: true, width: 1600 })
            } 1600w, ${
              getHomeHeroUrlTransformed({ noWebP: true, width: 1920 })
            } 1920w, ${
              getHomeHeroUrlTransformed({ noWebP: true, width: 2560 })
            } 2560w`"
            sizes="100vw"
            media="(min-width: 640px)"
          >
          <!-- Transparent GIF for browsers not supporting <picture> -->
          <img
            :src="content.blankImageBase64"
            :alt="$t({ id: 'pages.home.page_title' })"
            class="fit"
          >
        </picture>
      </div>
      <div class="hero__search stl-content-container stl-content-container--xlarge">
        <AppContent
          tag="h1"
          :class="[
            'text-h4 text-weight-medium q-my-none',
          ]"
          entry="pages"
          field="home.header"
        />
        <QTabs
          v-model="searchMode"
          class="q-my-sm hero__search-modes"
          align="left"
          breakpoint="0"
          dense
          no-caps
        >
          <QTab
            v-for="mode in nonDefaultSearchModes"
            :key="mode"
            :name="mode"
            :label="$t({ id: `form.search.modes.${mode}` })"
          />
        </QTabs>
        <form class="hero__search-bar row justify-center shadow-2" @submit.prevent="searchAssets">
          <div class="row no-wrap flex-item--grow">
            <QInput
              v-if="!searchByCategory"
              ref="heroSearchInput"
              v-model="query"
              class="flex-item--grow-shrink-auto"
              :label="$t({ id: 'form.search.query_placeholder' })"
              :debounce="300"
            />
            <CategoryAutocomplete
              v-if="searchByCategory"
              ref="heroSearchCategoryAutocomplete"
              class="hero__search-field flex-item--grow-shrink-auto"
              :text-debounce="300"
              :set-category="selectedCategory"
              :label="$t({ id: 'form.search.query_placeholder' })"
              :show-search-icon="false"
              pad-left
              @category-changed="selectCategory"
              @text-changed="t => { query = t }"
            />
            <PlacesAutocomplete
              v-show="isPlaceSearchEnabled"
              class="hero__search-field hero__search-place flex-item--grow-shrink-auto"
              pad-left
              :label="$t({ id: 'form.search.near_location_placeholder' })"
              :show-search-icon="false"
              prompt-current-position
              @selectPlace="selectPlace"
            />
            <AppDateRangePicker
              v-show="showDates"
              :start-date="startDate"
              :end-date="endDate"
              class="hero__search-field hero__search-dates"
              column-class="col-6"
              :label="$t({ id: 'form.date_placeholder' })"
              hide-hint
              @changeStartDate="startDate => setDates({ startDate })"
              @changeEndDate="endDate => setDates({ endDate })"
            />
          </div>
          <QBtn
            ref="heroSearchButton"
            class="hero__search-button text-weight-medium q-ma-sm q-px-sm"
            type="submit"
            :rounded="style.roundedTheme"
            color="info"
            dense
            no-caps
          >
            <QIcon
              :name="icons.matSearch"
              :left="true"
            />
            <AppContent
              class="gt-xs"
              entry="pages"
              field="home.form_button"
            />
          </QBtn>
        </form>
      </div>
    </section>
    <section :class="['home__features row justify-center' ,style.colorfulTheme ? 'bg-primary-gradient text-white' : '']">
      <div class="col-12 col-md-9 flex flex-center">
        <AppContent
          tag="h2"
          class="text-h5 text-center text-weight-medium q-my-xl q-mx-md"
          entry="pages"
          field="home.subheader"
        />
        <div
          v-if="videoUrl"
          class="full-width q-mb-lg home__features-video-aspect-ratio-container"
        >
          <iframe
            :src="videoUrl"
            class="home__features-video absolute-full"
            width="100%"
            height="100%"
            frameborder="0"
            :title="config.stelace.instant && config.stelace.instant.serviceName || ''"
            webkitallowfullscreen
            mozallowfullscreen
            allowfullscreen
          />
        </div>
      </div>
      <div class="col-12 stl-content-container stl-content-container--large row text-center q-mb-xl">
        <div class="col-12 col-md-4">
          <AppContent
            tag="h3"
            class="text-h6"
            entry="pages"
            field="home.features.feature_1_title"
          />
          <AppContent
            tag="p"
            entry="pages"
            field="home.features.feature_1_content"
          />
        </div>
        <div class="col-12 col-md-4">
          <AppContent
            tag="h3"
            class="text-h6"
            entry="pages"
            field="home.features.feature_2_title"
          />
          <AppContent
            tag="p"
            entry="pages"
            field="home.features.feature_2_content"
          />
        </div>
        <div class="col-12 col-md-4">
          <AppContent
            tag="h3"
            class="text-h6"
            entry="pages"
            field="home.features.feature_3_title"
          />
          <AppContent
            tag="p"
            entry="pages"
            field="home.features.feature_3_content"
          />
        </div>
      </div>
    </section>

    <section class="home__asset-gallery">
      <AppContent
        tag="h2"
        class="text-h5 text-weight-medium text-center q-my-lg"
        entry="pages"
        field="home.asset_gallery_header"
      />
      <AppCarousel
        class="stl-content-container stl-content-container--xlarge margin-h-center"
        :items="assets"
        :nb-items-per-slide="nbAssetsVisiblePerSlide"
        :nb-slides="nbCarouselSlides"
        :active="showCarousel"
      />
    </section>

    <!-- Use this for testimonials -->
    <!-- <section class="q-pa-lg">
      <AppContent
        tag="h3"
        class="text-h5 text-center"
        entry="pages"
        field="home.testimonials_header"
      />
    </section> -->

    <AppFooter />
  </q-page>
</template>

<style lang="stylus" scoped>
$background-image-loaded-from = 640px

.hero
  position: relative
  padding 5rem 1rem 2.5rem
  background-size: cover
  background-position: 50% 50%
  @media (max-width $background-image-loaded-from)
    // on mobile, don’t disturb users with the rest of the page
    // and make scroll required to see more
    height: 85vh
    display: flex
    justify-content: center
    align-items: center

.hero__background
  color: transparent
  img
    object-fit: cover
    @media (max-width $background-image-loaded-from)
      display: none
.blurred-svg-background
  position: absolute
  z-index: -1
  top: 0
  left: 0
  width: 100%
  height: 100%

.hero__search
  position: relative
  margin: 1rem auto
.hero__search-modes
  min-height: 2.5rem
  @media (max-width $breakpoint-xs-max)
    visibility: hidden
.hero__search-bar
  background-color: #FFF
  border-radius $generic-border-radius
.hero__search-field
  position:relative
  &:not(:first-child)::after
    content: ''
    position:absolute
    top: 25%
    bottom: 25%
    left: 0
    border-right: 1px solid $grey-4

.hero__search-place
  @media (max-width $breakpoint-xs-max)
    display: none
.hero__search-dates
  flex: 1 1 14rem
  @media (max-width $breakpoint-sm-max)
    display: none
.hero__search-button
  flex: 0 1 auto
  @media (max-width $breakpoint-xs-max)
    padding-left: $spaces.md.x

.hero__content
  z-index: 1

.rounded-overlay
  min-height 20rem
  position relative
  width 200%
  top -3rem
  left -50%
  margin-bottom -3rem
  padding-top 3rem
  border-top-left-radius 100%
  border-top-right-radius 100%
  box-shadow 0 -18px 36px 0 rgba(0,0,0,.2)

.bg-secondary-gradient
  min-height 20rem

.home__features
  background: $background-color
  background: var(--stl-color-background)

// Video

.home__features-video-aspect-ratio-container
  position: relative
  padding-top: 56.25% // 16/9 ratio

// Pricing

.home__pricing
  z-index 1
  min-height 35rem
  margin-bottom 4rem
  padding-top 5rem

.home__pricing-description
  max-width 50rem
  margin: 2rem auto 3rem

.home__pricing-background
  z-index -1
  transform skewY(4deg)

// Assets

.home__asset-gallery
  padding: 0 0 4rem
  // Note that colon is required to avoid parsing errors
  margin: $spaces.md.y $spaces.md.x $spaces.xl.y
  @media (min-width $breakpoint-sm-min)
    margin: $spaces.md.y $spaces.xl.x $spaces.xl.y

.q-carousel
  height: auto
</style>

<style lang="stylus">
.blurred-svg-background svg
  height: 100%
  width: 100%
</style>
