<script>
import { mapState, mapGetters } from 'vuex'
import { get } from 'lodash'

import AppCarousel from 'src/components/AppCarousel'
import AppSVGActionButton from 'src/components/AppSVGActionButton'
import DatePickerInput from 'src/components/DatePickerInput'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'
import SelectCategories from 'src/components/SelectCategories'

import * as types from 'src/store/mutation-types'

import PageComponentMixin from 'src/mixins/pageComponent'

export default {
  name: 'Home',
  components: {
    AppCarousel,
    AppSVGActionButton,
    DatePickerInput,
    PlacesAutocomplete,
    SelectCategories,
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      location: null,
      selectedCategory: null,
      query: '',
      startDate: '',
      searchByCategory: process.env.VUE_APP_SEARCH_BY_CATEGORY === 'true',
      assets: [],
      nbAssetsPerSlideDefault: 3,
      nbCarouselSlides: 4, // Can be less when there are few assets, set to 1 to disable
    }
  },
  computed: {
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
    ...mapState({
      style: state => state.style,
      config: state => state.common.config,
      locale: state => state.content.locale || 'en',
      auth: state => state.auth,
    }),
    ...mapGetters([
      'currentUser',
      'defaultSearchMode',
      'homeHeroUrlTransformed',
    ]),
  },
  watch: {
    '$route' () {
      this.handleUrlRedirection(this.$route)
    }
  },
  created () {
    this.$store.dispatch('fetchLastAssets', {
      nbResults: this.nbAssetsPerSlideDefault * this.nbCarouselSlides
    }).then(assets => { this.assets = assets })
  },
  methods: {
    async afterAuth () {
      const {
        'reset-password': resetPasswordToken,
        check,
        status,
        code,
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
    selectStartDate (startDate) {
      this.startDate = startDate
    },
    async searchAssets () {
      if (this.searchByCategory) {
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
        reset: true
      })

      this.$router.push({ name: 'search' })
    },
  }
}
</script>

<template>
  <q-page>
    <section class="hero row items-center">
      <QImg
        class="hero__background absolute-full"
        :src="homeHeroUrlTransformed"
        :placeholder-src="style.homeHeroBase64"
        spinner-color="white"
        spinner-size="0"
      />
      <div class="hero__content col-12 col-sm-6 col-md-4 offset-sm-2">
        <div
          :class="[
            'q-pa-md hero__search',
            style.homeHasLightBackground ? 'hero__search--dark' : 'hero__search--light',
            style.roundedTheme ? 'hero__search--round' : ''
          ]"
        >
          <AppContent
            tag="h1"
            :class="[
              'text-h4 text-weight-medium q-mt-none',
              style.homeHasLightBackground ? 'text-white' : ''
            ]"
            entry="pages"
            field="home.header"
          />
          <div class="hero__search-form">
            <q-input
              v-if="!searchByCategory"
              v-model="query"
              dense
              bottom-slots
              :dark="style.homeHasLightBackground"
              :standout="style.homeHasLightBackground"
              :filled="!style.homeHasLightBackground"
              :label="$t({ id: 'form.search.query_placeholder' })"
            />
            <SelectCategories
              v-if="searchByCategory"
              :initial-category="selectedCategory"
              dense
              bottom-slots
              :dark="style.homeHasLightBackground"
              :standout="style.homeHasLightBackground"
              :filled="!style.homeHasLightBackground"
              :label="$t({ id: 'form.search.query_placeholder' })"
              :show-search-icon="false"
              @change="selectCategory"
            />
            <PlacesAutocomplete
              dense
              bottom-slots
              :dark="style.homeHasLightBackground"
              :standout="style.homeHasLightBackground"
              :filled="!style.homeHasLightBackground"
              :label="$t({ id: 'form.search.near_location_placeholder' })"
              @selectPlace="selectPlace"
            />
            <DatePickerInput
              dense
              bottom-slots
              :date="startDate"
              :dark="style.homeHasLightBackground"
              :standout="style.homeHasLightBackground"
              :filled="!style.homeHasLightBackground"
              :label="$t({ id: 'form.date_placeholder' })"
              @change="selectStartDate"
            />
          </div>
          <div class="row justify-end">
            <component
              :is="style.hasSVGActionButton ? 'AppSVGActionButton' : 'QBtn'"
              class="text-weight-medium"
              :rounded="style.roundedTheme"
              :label="$t({ id: 'pages.home.form_button' })"
              color="secondary"
              size="lg"
              no-caps
              @click="searchAssets"
            />
          </div>
        </div>
      </div>
    </section>
    <section :class="['home__features row justify-center' ,style.colorfulTheme ? 'bg-primary-gradient text-white' : '']">
      <div class="col-12 col-md-9 flex flex-center">
        <AppContent
          tag="h2"
          class="text-h4 text-center text-weight-medium q-my-xl q-mx-md"
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
        class="text-h5 text-weight-medium text-center"
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
.hero
  position relative

@media (min-width $breakpoint-sm-min)
  .hero
    min-height 100vh // can be higher on mobile screen with landscape orientation
    padding 5rem 0

.hero__search
  border-radius $generic-border-radius
.hero__search--round
  border-radius 10px
.hero__search--dark
  background-color $dimmed-background
  background-color var(--stl-home-search-card-background, $dimmed-background)
.hero__search--light
  background-color $light-dimmed-background
  background-color var(--stl-home-search-card-background, $light-dimmed-background)

@media (max-width $breakpoint-xs-max)
  .hero__search
    border-radius 0
  .hero__search--dark, .hero__search--light
    padding-top 1.5 * $toolbar-min-height

@media (min-width $breakpoint-sm-min)
  .hero__search
    max-width 26rem

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
  padding: 2rem 0 4rem
  // Note that colon is required to avoid parsing errors
  margin: $spaces.md.y $spaces.md.x $spaces.xl.y
  @media (min-width $breakpoint-sm-min)
    margin: $spaces.md.y $spaces.xl.x $spaces.xl.y

.q-carousel
  height: auto
</style>
