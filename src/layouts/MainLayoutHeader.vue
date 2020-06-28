<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import {
  matAddBox,
  matClose,
  matLock,
  matMail,
  matPowerSettingsNew,
  matSearch
} from '@quasar/extras/material-icons'
import { mdiGithubCircle } from '@quasar/extras/mdi-v4'

import { isPlaceSearchEnabled } from 'src/utils/places'

import AppLocaleSwitch from 'src/components/AppLocaleSwitch'
import AppLogo from 'src/components/AppLogo'
import AppMiniLogo from 'src/components/AppMiniLogo'
import SearchToolbar from 'src/components/SearchToolbar'
import CategoryAutocomplete from 'src/components/CategoryAutocomplete'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'

import AuthDialogMixin from 'src/mixins/authDialog'
import GeolocationMixin from 'src/mixins/geolocation'

export default {
  components: {
    AppLocaleSwitch,
    AppLogo,
    AppMiniLogo,
    PlacesAutocomplete,
    SearchToolbar,
    CategoryAutocomplete,
  },
  mixins: [
    AuthDialogMixin,
    GeolocationMixin,
  ],
  data () {
    return {
      priceInputTouched: false,
      searchByCategory: process.env.VUE_APP_SEARCH_BY_CATEGORY === 'true',
      creatingOrganization: false,
      isPlaceSearchEnabled,
    }
  },
  computed: {
    isMenuOpened () {
      return this.layout.isMenuOpened
    },
    isHome () {
      return this.route.name === 'home'
    },
    hasHomeBackground () {
      return this.homeHeroUrlTransformed || this.style.homeHeroBase64
    },
    isSearch () {
      return this.route.name === 'search'
    },
    SSOLoginOnly () {
      return process.env.VUE_APP_SSO_LOGIN_ONLY === 'true'
    },
    selectedCategory () {
      const selectedCategoryId = this.search.searchFilters.filters.categoryId
      if (!selectedCategoryId) return null

      const category = this.common.categoriesById[selectedCategoryId]
      return category
    },
    userConversations () {
      return this.conversations.filter(c => !c.isEmpty)
    },
    hasConversations () {
      return this.userConversations.length > 0
    },
    nbUnreadConversations () {
      return this.userConversations.reduce((count, c) => count + !c.read, 0)
    },
    accountName () {
      return this.currentUser.firstName // TODO: i18n for name/familyName order
        ? `${this.currentUser.firstName} ${this.currentUser.lastName || ''}` : this.currentUser.displayName
    },
    showAccountAvatar () {
      return this.$q.screen.gt.xs
    },
    showLocaleSwitch () {
      return process.env.VUE_APP_LOCALE_SWITCH === 'true'
    },
    showGithubForkButton () {
      return process.env.VUE_APP_GITHUB_FORK_BUTTON === 'true'
    },
    ...mapState([
      'common',
      'content',
      'layout',
      'search',
      'style',
      'route',
      'auth',
    ]),
    ...mapGetters([
      'conversations',
      'currentUser',
      'currentOrganizations',
      'defaultSearchMode',
      'currentUserPosition',
      'displayAssetDistance',
      'homeHeroUrlTransformed',
    ]),
  },
  watch: {
    async currentUser (current, previous) {
      if (current.id !== previous.id) {
        this.$store.dispatch('selectSearchMode', { searchMode: this.defaultSearchMode })

        // current can be an empty object if the user isn't authenticated
        if (current.locations && current.locations.length) {
          const loc = current.locations[0]

          this.$store.commit({
            type: mutationTypes.SET_SEARCH_LOCATION,
            queryLocation: loc.shortDisplayName,
            latitude: loc.latitude,
            longitude: loc.longitude
          })
        } else if (this.displayAssetDistance) {
          await this.fetchUserGeolocation()

          if (this.currentUserPosition) {
            this.$store.commit({
              type: mutationTypes.SET_SEARCH_LOCATION,
              queryLocation: this.$t({ id: 'places.current_position' }),
              latitude: this.currentUserPosition.latitude,
              longitude: this.currentUserPosition.longitude
            })
          }
        }

        if (this.isSearch) this.searchAssets()
        if (current.id) await this.$store.dispatch('fetchMessages')
      }
    },
  },
  async mounted () {
    if (this.displayAssetDistance) {
      await this.fetchUserGeolocation()

      if (this.currentUserPosition) {
        this.$store.commit({
          type: mutationTypes.SET_SEARCH_LOCATION,
          queryLocation: this.$t({ id: 'places.current_position' }),
          latitude: this.currentUserPosition.latitude,
          longitude: this.currentUserPosition.longitude
        })
      }
    }
  },
  created () {
    this.icons = {
      matAddBox,
      matClose,
      matLock,
      matMail,
      matSearch,
      matPowerSettingsNew,
      mdiGithubCircle
    }
  },
  methods: {
    toggleMenu (visible = !this.isMenuOpened) {
      this.$store.commit(mutationTypes.LAYOUT__TOGGLE_MENU, { visible })
    },
    logout () {
      this.$store.dispatch('logout')

      if (this.$route.meta.mustBeLogged) {
        this.$router.push({ path: '/' })
      }
    },
    async searchAssets () {
      if (this.isSearch) {
        await this.$store.dispatch('searchAssets')
      } else {
        this.$router.push({ name: 'search' })
      }
    },
    updateQuery (query) {
      this.$store.commit(mutationTypes.SET_SEARCH_QUERY, { query })

      this.searchAssets()
    },
    selectCategory (category) {
      this.$store.commit({
        type: mutationTypes.SEARCH__SET_SEARCH_FILTERS,
        filters: {
          categoryId: category && category.id
        }
      })

      this.searchAssets()
    },
    selectPlace (place) {
      if (place) {
        this.$store.commit({
          type: mutationTypes.SET_SEARCH_LOCATION,
          queryLocation: place.shortDisplayName,
          latitude: place.latitude,
          longitude: place.longitude
        })
      } else {
        this.$store.commit({
          type: mutationTypes.UNSET_SEARCH_LOCATION
        })
      }

      this.$store.commit({
        type: mutationTypes.SEARCH__SET_MAP_OPTIONS,
        useMapCenter: false,
        latitude: null,
        longitude: null
      })

      this.searchAssets()
    },
    async fetchUserGeolocation () {
      if (!this.displayAssetDistance) return
      if (this.currentUserPosition) return
      if (!this.geolocationSupported) return // from geolocation mixin

      // if geolocation was previously granted, automatically get the GPS position of current user
      const permissionState = await this.getGeolocationPermissionState() // from geolocation mixin
      if (permissionState === 'granted') {
        await this.getUserGeolocation({ silentError: true }) // from geolocation mixin
      }
    },
  }
}
</script>

<template>
  <QHeader
    reveal
    :bordered="!isHome && !isMenuOpened"
    :reveal-offset="100"
    :class="[
      isHome && hasHomeBackground ? 'q-pa-md transparent-header' : 'bg-white',
      isMenuOpened ? 'header--raise-above-menu-dialog' : ''
    ]"
  >
    <QToolbar>
      <AppLink
        :class="[
          isHome && hasHomeBackground ? '' : 'text-primary',
          'logo-container anchor-text--reset cursor-pointer q-mr-sm'
        ]"
        :to="{ name: 'home' }"
        :aria-label="$t({ id: 'navigation.home' })"
        flat
      >
        <AppLogo class="company-logo gt-xs q-mr-sm" />
      </AppLink>

      <QBtn
        :class="[
          isHome && hasHomeBackground ? '' : 'text-primary',
          'logo-container mini-logo-container q-mr-sm'
        ]"
        :aria-label="$t({ id: 'navigation.menu' })"
        flat
        @click="toggleMenu"
      >
        <AppMiniLogo class="company-mini-logo current-color xs" />
      </QBtn>

      <div
        v-show="!isHome && !isMenuOpened"
        class="header__search-bar row no-wrap shadow-2"
      >
        <QInput
          v-if="!searchByCategory"
          ref="headerSearchInput"
          :value="search.query"
          :input-class="search.query ? 'text-right' : ''"
          :label="$t({ id: 'form.search.query_placeholder' })"
          :debounce="500"
          dense
          @input="updateQuery"
        >
          <template v-slot:prepend>
            <QBtn
              :aria-label="$t({ id: 'form.search.query_placeholder' })"
              color="primary"
              :icon="icons.matSearch"
              flat
              dense
              rounded
              @click="searchAssets"
            />
          </template>
          <template v-slot:append>
            <QIcon
              v-show="search.query.length"
              ref="clearHeaderSearchInput"
              class="cursor-pointer"
              :name="icons.matClose"
              @click="updateQuery('')"
            />
          </template>
        </QInput>
        <CategoryAutocomplete
          v-if="searchByCategory"
          ref="headerCategoryAutocompleteInput"
          :text-debounce="500"
          :set-category="selectedCategory"
          :set-text="search.query"
          :label="$t({ id: 'form.search.query_placeholder' })"
          :icon-button-action="searchAssets"
          dense
          pad-left
          icon-color="primary"
          search-icon-position="left"
          @category-changed="selectCategory"
          @text-changed="updateQuery"
        />
        <PlacesAutocomplete
          v-show="isPlaceSearchEnabled"
          class="gt-sm"
          :label="$t({ id: 'form.search.near_location_placeholder' })"
          :hide-input-on-select="true"
          icon-color="grey-4"
          search-icon-position="left"
          read-search-store
          prompt-current-position
          dense
          pad-left
          @selectPlace="selectPlace"
        />
      </div>

      <QSpace />

      <QBtn
        v-if="currentUser.id"
        v-show="hasConversations"
        :to="{ name: 'inbox' }"
        :class="['q-mx-md header__inbox', isMenuOpened ? 'invisible' : '']"
        :aria-label="$t({ id: 'navigation.inbox' })"
        :color="isHome ? 'white' : ( style.colorfulTheme ? 'primary' : 'default-color')"
        flat
        round
        :icon="icons.matMail"
      >
        <QBadge
          v-show="nbUnreadConversations"
          class="inbox-badge"
          color="red"
        >
          {{ nbUnreadConversations }}
        </QBadge>
      </QBtn>

      <QBtn
        v-show="!currentUser.id"
        flat
        no-caps
        :class="[
          'flex-item--auto q-mx-md text-weight-medium gt-xs',
          isHome ? 'text-white' : 'text-default-color',
          isMenuOpened ? 'invisible' : ''
        ]"
        @click="openAuthDialog({ redirectAfterSignup: true })"
      >
        {{ $t({ id: 'authentication.log_in_button' }) }}
      </QBtn>

      <AppLocaleSwitch v-if="showLocaleSwitch" text-color="default-color" />

      <AppLink
        v-if="showGithubForkButton"
        to="https://github.com/stelace/marketplace-demo"
        class="q-mr-md gt-md flex-item--auto anchor-text--reset"
      >
        <QBtn
          class="bg-github text-white q-px-sm text-weight-bold"
          :loading="content.fetchingContentStatus"
          :rounded="style.roundedTheme"
          align="between"
          dense
        >
          <QIcon :name="icons.mdiGithubCircle" left />
          <AppContent entry="navigation" field="github_button" />
        </QBtn>
      </AppLink>

      <QBtn
        class="create-asset-button q-px-md flex-item--auto text-weight-bold"
        :to="{ name: 'newAsset' }"
        :loading="content.fetchingContentStatus"
        :rounded="style.roundedTheme"
        :label="$t({ id: 'navigation.new_listing' })"
        :icon="icons.matAddBox"
        color="secondary"
        align="between"
        dense
      />

      <QBtn
        v-if="currentUser.id && showAccountAvatar"
        class="q-ml-sm"
        flat
      >
        <AppAvatar
          :user="currentUser"
          size="2rem"
        />
        <QMenu ref="accountMenu" content-class="header__account-menu">
          <div class="q-pa-md">
            <div class="text-weight-medium q-mb-md">
              <AppContent
                class="text-h6"
                entry="navigation"
                field="account"
              />
            </div>
            <div class="text-center text-body1 text-weight-medium q-mb-md">
              {{ accountName }}
            </div>
            <div class="column items-stretch">
              <AppContent
                v-close-popup
                tag="QBtn"
                entry="user"
                field="account.update_profile_button"
                :to="{ name: 'publicProfile', params: { id: currentUser.id } }"
                :rounded="style.roundedTheme"
                class="q-mb-md self-center"
                color="primary"
              />
              <QBtn
                v-if="!SSOLoginOnly"
                class="q-mb-sm"
                align="left"
                flat
                @click="openAuthDialog({ formType: 'changePassword' })"
              >
                <QIcon
                  :name="icons.matLock"
                  :left="true"
                />
                <AppContent
                  entry="user"
                  field="account.new_password_label"
                />
              </QBtn>
              <QBtn
                v-close-popup
                align="left"
                flat
                @click="logout"
              >
                <QIcon
                  :name="icons.matPowerSettingsNew"
                  :left="true"
                />
                <AppContent
                  entry="authentication"
                  field="log_out_button"
                />
              </QBtn>
            </div>
          </div>
        </QMenu>
      </QBtn>
    </QToolbar>

    <QDialog
      :value="isMenuOpened"
      maximized
      transition-show="slide-down"
      transition-hide="slide-up"
      @input="toggleMenu"
    >
      <div class="bg-white navigation-menu">
        <QList>
          <QItem
            v-close-popup
            :to="{ name: 'home' }"
            exact-active-class="text-weight-medium"
            clickable
          >
            <QItemSection>{{ $t({ id: 'navigation.home' }) }}</QItemSection>
          </QItem>

          <QItem
            v-close-popup
            :to="{ name: 'search' }"
            exact-active-class="text-weight-medium"
            clickable
          >
            <QItemSection>{{ $t({ id: 'navigation.search' }) }}</QItemSection>
          </QItem>

          <QItem
            v-close-popup
            :to="{ name: 'newAsset' }"
            exact-active-class="text-weight-medium"
            clickable
          >
            <QItemSection>{{ $t({ id: 'navigation.new_listing' }) }}</QItemSection>
          </QItem>

          <div v-if="!showAccountAvatar">
            <QSeparator />

            <QItem
              v-show="!currentUser.id"
              v-close-popup
              clickable
              @click="openAuthDialog({ redirectAfterSignup: true })"
            >
              <QItemSection>{{ $t({ id: 'authentication.log_in_button' }) }}</QItemSection>
            </QItem>

            <QItem
              v-show="currentUser.id"
              v-close-popup
              :to="{ name: 'publicProfile', params: { id: currentUser.id }}"
              exact-active-class="text-weight-medium"
              clickable
            >
              <QItemSection>{{ $t({ id: 'navigation.profile' }) }}</QItemSection>
            </QItem>
            <QItem
              v-show="currentUser.id"
              v-close-popup
              clickable
              @click="logout"
            >
              <QItemSection>{{ $t({ id: 'authentication.log_out_button' }) }}</QItemSection>
            </QItem>
          </div>
        </QList>
      </div>
    </QDialog>

    <SearchToolbar />
  </QHeader>
</template>

<style lang="stylus" scoped>
$header-min-breakpoint = 359px

.transparent-header
  background: linear-gradient(180deg, rgba(0,0,0,0.8) -80%, rgba(0,0,0,0) 100%), \
              linear-gradient(170deg, rgba(0,0,0,0.8) -80%, rgba(0,0,0,0) 18%)

.header--raise-above-menu-dialog
  z-index: $z-fullscreen + 1

.logo-container svg
  max-height: $toolbar-min-height
.logo-container:not(.mini-logo-container)
  @media (max-width $breakpoint-xs-max)
    display: none
.mini-logo-container
  @media (min-width $breakpoint-sm-min)
    display: none
.company-logo
  width: 9rem
.company-mini-logo
  height: 1.8rem

// Form
.header__search-bar
  border-radius: $generic-border-radius
  // Handle long input
  max-width: calc(100% - 4rem) // Make place for logo
  @media (min-width $header-min-breakpoint)
    max-width: calc(100% - 8rem) // and inbox icon
  @media (min-width $breakpoint-sm-min)
    max-width: 50%
  > .q-field
    min-width: 10rem // ensure visible placeholder when input is hidden after select in PlacesAutocomplete
    max-width: 20rem
    @media (min-width $breakpoint-md-min) and (max-width $breakpoint-md-max)
      max-width: 15rem

.header__inbox
  @media (max-width: $header-min-breakpoint)
    display: none
.inbox-badge
  position: absolute
  top: 0
  right: 0
  pointer-events: none
  border-radius: $badge-rounded-border-radius

.create-asset-button
  @media (max-width: 850px)
    display: none

// Menu Dialog
.navigation-menu
  padding-top: 1.5 * $toolbar-min-height
</style>

<style lang="stylus">
.filter-dialog .fixed-full
  top: 2 * $toolbar-min-height

// Local quasar override
.header__search-bar
  .q-field__label
    color: $font-color
    opacity: inherit
    font-weight: 500

// Ensuring button text does not wrap
// Don’t set it too high though due to Quasar automatic sizing
.header__account-menu
  min-width: 260px

</style>
